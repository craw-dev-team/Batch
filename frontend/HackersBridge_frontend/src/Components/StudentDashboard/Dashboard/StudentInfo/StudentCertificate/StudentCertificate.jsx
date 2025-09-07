import React, { useEffect } from "react";
import { Card, Button, Empty, Tag } from "antd";
import { DownloadOutlined, FileDoneOutlined } from "@ant-design/icons";
import { useStudentCertificate } from "./StudentCertificateContext";

const StudentCertificate = () => {
  const { studentCertificate, fetchStudentCertificate, loading } = useStudentCertificate();
  const certificates = studentCertificate?.certificates || [];


  useEffect(() => {
    fetchStudentCertificate();
  }, []);
  

  // HANDLE DOWNLOAD CERTIFICATE 
  const handleDownload = async (url, filename) => {

  
    try {
      const response = await axios.get(url, {
        responseType: "blob",
        withCredentials: true,
      });
  
      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
  
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download error:", error);
    }
  };
  
  
  const issuedCertificates = certificates.filter(cert => cert.certificate_available);


  return (
    <div className="bg-white rounded-md shadow p-6 w-full mx-auto mt-0.5">

      <div className="p-0">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 ">
        Certificates
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        {!loading && issuedCertificates.length > 0 ? (
            issuedCertificates.map((cert, index) => (
            <Card
            key={index}
            title={cert.course_name}
            bordered
            className="shadow relative bg-green-50"
            style={{
              backgroundImage: cert.certificate_available && cert.download_url
                ? `url(${cert.download_url})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              // minHeight: "100px",
              // color: cert.certificate_available ? "white" : "inherit",
              color: "white",
            }}
          >
            <div className=" p-0 rounded-md relative">
              {/* <p className="text-sm text-black mb-2">
                {cert.certificate_available ? "Certificate Available" : "Not Available"}
              </p> */}
             
              <p>
              {cert.certificate_available && cert.pdf_base64 ? (
                <div style={{ height: "200px", overflow: "hidden", marginBottom: "1rem", }}>
                <iframe
                  src={`data:application/pdf;base64,${cert.pdf_base64}#toolbar=0&navpanes=0&scrollbar=0`}
                  width="100%"
                  height="400px" // Full height, only top part visible
                  title={`Certificate - ${cert.course_name}`}
                  style={{  filter: "blur(1px)",}}
                />
              </div>
              ) : (
                <>
                  <p className="text-white italic mb-3">
                    {cert.message || "Certificate not available."}
                  </p>
                </>
              )}
              </p>
              <p className="text-sm text-black italic">
                Certificate Date
              </p>
              <p className="text-sm text-black bold">
                {cert.certificate_date || "No date provided"}
                {cert.certificate_available && cert.download_url && (
                  <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  className="absolute bottom-2 right-1 bg-green-500 hover;bg-green-600"
                  onClick={() => handleDownload(cert.download_url, cert.course_name)}
                  >
                
                </Button>
              )}
              </p>
          
          
          </div>
          </Card>
        ))
      ) : (
        <div className="col-span-full">
            <Empty description="No Certificates Available" />
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default StudentCertificate;
