// src/components/EmailPopup.jsx
import React, { useEffect, useState } from 'react';
import { Modal, List, message, Input } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import templates from '../../EmailTemplates';
import axios from 'axios';
import BASE_URL from '../../ip/Ip';

import Quill from 'quill';
import { useSpecificBatch } from '../dashboard/Contexts/SpecificBatch';
import { useCoordinatorForm } from '../dashboard/AddDetails/Coordinator/CoordinatorContext';



const AlignStyle = Quill.import('attributors/style/align');
Quill.register(AlignStyle, true);



const EmailPopup = ({ open, onClose, checkStudentid, onSuccess = () => {}, trainer_email }) => {
    if (!open) return null;

    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [editorContent, setEditorContent] = useState('');
    const [loading, setLoading] = useState(false);

    const { specificBatch } = useSpecificBatch();
    
    // store to fields of email --- to whom this email you want to send and also add email there 
    const [BccEmails, setBccEmails] = useState([]);
    const [inputEmail, setInputEmail] = useState("");

    const [toEmails, setToEmails] = useState([]);
    const [inputToEmail, setInputToEmail] = useState('');

    const [ccEmails, setCcEmails] = useState([]);
    const [inputCcEmail, setInputCcEmail] = useState('');

    const [emailSubject, setEmailSubject] = useState("");

    const { coordinatorData, fetchCoordinators } = useCoordinatorForm();



    
    useEffect(() => {
      fetchCoordinators();
    },[]);



    useEffect(() => {
      if (open && checkStudentid?.length) {
        const uniqueEmails = [...new Set(checkStudentid.map(s => s.emails))];
        setBccEmails(uniqueEmails);
      }

        if (coordinatorData?.length > 0) {
          const emails = coordinatorData
            .filter(c => c.status !== 'Inactive')
            .map(c => c.email);

          setToEmails(emails);
        }

        if (trainer_email) {
          setCcEmails([trainer_email])
        }

    }, [open, checkStudentid, coordinatorData]);
    


    useEffect(() => {
      if (open) {
        const firstTemplate = Object.keys(templates)[0];
        if (firstTemplate) {
          setSelectedTemplate(firstTemplate);
          const html = templates[firstTemplate](specificBatch);
          setEditorContent(html);
        }
      }
    }, [open, specificBatch]);

    

    const handleTemplateClick = (name) => {
        const template = templates[name];
        if (template) {
        const html = template(specificBatch); 
        setEditorContent(html);
        setSelectedTemplate(name);
      }
    };


    const convertQuillClassesToInlineStyles = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
      
        const alignments = {
          'ql-align-center': 'center',
          'ql-align-right': 'right',
          'ql-align-justify': 'justify',
          'ql-align-left': 'left',
        };
      
        Object.entries(alignments).forEach(([cls, align]) => {
          const elements = doc.querySelectorAll(`.${cls}`);
          elements.forEach(el => {
            el.style.textAlign = align;
            el.classList.remove(cls);
          });
        });
      
        return doc.body.innerHTML;
      };

      
    const cleanedHtml = convertQuillClassesToInlineStyles(editorContent);
      

    // this will send emails to server 
    const handleSend = async () => {

        setLoading(true);

          // Combine To emails
          const finalToEmails = new Set(toEmails);
          if (inputToEmail && emailRegex.test(inputToEmail.trim())) {
            finalToEmails.add(inputToEmail.trim());
            setInputToEmail('');
          }

          // Combine Cc emails
          const finalCcEmails = new Set(ccEmails);
          if (inputCcEmail && emailRegex.test(inputCcEmail.trim())) {
            finalCcEmails.add(inputCcEmail.trim());
            setInputCcEmail('');
          }

        // for Bcc only 
        const trimmed = inputEmail.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
        // Get emails from selected students
        const selectedEmails = checkStudentid.map((s) => s.emails);
      
        // Combine all emails: selected + added + (inputEmail if valid)
        const combinedEmailsSet = new Set([...selectedEmails, ...BccEmails]);
      
        if (trimmed && emailRegex.test(trimmed) && !combinedEmailsSet.has(trimmed)) {
          combinedEmailsSet.add(trimmed);
          setInputEmail('');  // clear input after adding to send list
        }
      
        const combinedBccEmails = Array.from(combinedEmailsSet);

          const payload =  {
            email_send_to: Array.from(finalToEmails),
            email_send_cc: Array.from(finalCcEmails),
            email_send_bcc: combinedBccEmails,
            email_html: cleanedHtml,
            email_subject: emailSubject,
            email_type: selectedTemplate
          }
          
        try {
            const response = await axios.post(`${BASE_URL}/api/emailsender/`,
              payload,
              { headers: { 'Content-Type': 'application/json' }, 
              withCredentials: true,
            }  
            );
            
            if (response.status >= 200 && response.status <= 299) {
                message.success("Email sent successfully");
                onSuccess();
                onClose();
            } else {
                message.error("Unexpected response from server");
            }
          } catch (error) {
              console.error("Error sending email:", error);
          } finally {
              setLoading(false);
          }
        };



  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSend}
      title="Send Email"
      width={1300}
      okText="Send"
      cancelText="Cancel"
      okButtonProps={{ disabled: loading }}
      style={{ height: '760px',  position: 'relative', top: '2rem' }}
    >
      {/* To field  */}
      <div className="mb-1">
        <span className='flex items-end font-semibold p-1'><label>To :</label></span>
        <div className="flex flex-wrap gap-2 border border-gray-200 rounded-md">
          {toEmails.map((email) => (
            <span
              key={email}
              className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded flex items-center gap-1"
            >
              {email}
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => setToEmails(toEmails.filter((e) => e !== email))}
              >
                ×
              </button>
            </span>
          ))}

          <Input
            type="email"
            value={inputToEmail}
            onChange={(e) => setInputToEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const trimmed = inputToEmail.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (trimmed && emailRegex.test(trimmed) && !toEmails.includes(trimmed)) {
                  setToEmails([...toEmails, trimmed]);
                  setInputToEmail('');
                }
              }
            }}
            placeholder="Add email here"
            className="h-6 text-sm flex-grow border-none outline-none rounded-md"
          />
        </div>
      </div>
            {/* end  */}


            {/* for cc  */}
            <div className='my-0'>
              <span className='flex items-end font-semibold p-1'><label htmlFor="Cc">Cc :</label></span>
                <div className="flex flex-wrap gap-2 border border-gray-200 rounded-md">
                {ccEmails.map((email) => (
                  <span
                    key={email}
                    className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded flex items-center gap-1"
                  >
                    {email}
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setCcEmails(ccEmails.filter((e) => e !== email))}
                    >
                      ×
                    </button>
                  </span>
                ))}

            <Input
              type="email"
              value={inputCcEmail}
              onChange={(e) => setInputCcEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  const trimmed = inputCcEmail.trim();
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (trimmed && emailRegex.test(trimmed) && !ccEmails.includes(trimmed)) {
                    setCcEmails([...ccEmails, trimmed]);
                    setInputCcEmail("");
                  }
                }
              }}
              placeholder="Add Cc email here"
              className="h-6 text-sm flex-grow border-none outline-none rounded-md"
            />
              </div>
           </div>

            {/* for Bcc  */}
            <div className='my-2'>
              <span className='flex items-end font-semibold p-1'><label htmlFor="Bcc">Bcc :</label></span>
              <div className="flex flex-wrap gap-2 border border-gray-200 rounded-md">
                {BccEmails.map((email) => (
                  <span
                    key={email}
                    className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded flex items-center gap-1"
                  >
                    {email}
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setBccEmails(BccEmails.filter((e) => e !== email))}
                    >
                      ×
                    </button>
                  </span>
                ))}

            <Input
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  const trimmed = inputEmail.trim();
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (trimmed && emailRegex.test(trimmed) && !BccEmails.includes(trimmed)) {
                    setBccEmails([...BccEmails, trimmed]);
                    setInputEmail("");
                  }
                }
              }}
              placeholder="Add Bcc email here"
              className="h-6 text-sm flex-grow border-none outline-none rounded-md"
            />
              </div>
            </div>

            {/* for Subject   */}
            <div className='flex my-4'>
              <span className='flex items-end font-semibold p-1'><label htmlFor="Subject">Subject:</label></span>
                <Input 
                  placeholder="Subject" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="h-6 text-sm border-gray-400 border-t-0 border-x-0 focus:border-blue-300 focus:ring-0"
                />
            </div>




      <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar of templates */}
        <div className="md:w-1/4 w-full bg-gray-100 p-3 rounded overflow-y-auto ">
          <h3 className="font-semibold mb-3">Templates</h3>
          <List
            size="small"
            bordered
            dataSource={Object.keys(templates)}
            renderItem={(item) => (
              <List.Item
                className={`cursor-pointer transition-colors duration-200 ${
                  item === selectedTemplate ? 'bg-blue-100 font-medium' : 'hover:bg-gray-200'
                }`}
                onClick={() => handleTemplateClick(item) }
              >
                {item}
              </List.Item>
            )}
          />
        </div>


        {/* Rich Text Editor */}
        <div className="md:w-3/4 w-full h-1/3">
          <ReactQuill
            theme="snow"
            value={editorContent}
            onChange={setEditorContent}
            style={{ height: '360px', marginBottom: '40px' }}
            modules={{
              toolbar: [
                [{ header: [1, 2, 4, 5, false] }],
                [{ align: [] }],
                ['bold', 'italic', 'underline'],
                ['link'],
                ['clean'],
              ],
            }}
            formats={[
              'header', 'align', 'bold', 'italic', 'underline', 'link'
            ]}
          />
        </div>
      </div>
    </Modal>
  );
};

export default EmailPopup;



