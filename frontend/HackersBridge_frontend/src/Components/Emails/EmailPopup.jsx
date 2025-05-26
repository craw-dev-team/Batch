// src/components/EmailPopup.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Button, List, message, Input } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import templates from '../../EmailTemplates';
import axios from 'axios';
import BASE_URL from '../../ip/Ip';

import Quill from 'quill';
import { useSpecificBatch } from '../dashboard/Contexts/SpecificBatch';



const AlignStyle = Quill.import('attributors/style/align');
Quill.register(AlignStyle, true);



const EmailPopup = ({ open, onClose, selectedStudents }) => {
    if (!open) return null;

    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [editorContent, setEditorContent] = useState('');
    const [loading, setLoading] = useState(false);

    const { specificBatch } = useSpecificBatch();
    
    // store to fields of email --- to whom this email you want to send and also add email there 
    const [toEmails, setToEmails] = useState([]);
    const [inputEmail, setInputEmail] = useState("");
    const [emailSubject, setEmailSubject] = useState("");



    useEffect(() => {
      if (open && selectedStudents?.length) {
        const uniqueEmails = [...new Set(selectedStudents.map(s => s.emails))];
        setToEmails(uniqueEmails);
      }
    }, [open, selectedStudents]);
    


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
      

    const handleSend = async () => {

        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found, user might be logged out.");
        return;
        };

        setLoading(true);

        const trimmed = inputEmail.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
        // Get emails from selected students
        const selectedEmails = selectedStudents.map((s) => s.emails);
      
        // Combine all emails: selected + added + (inputEmail if valid)
        const combinedEmailsSet = new Set([...selectedEmails, ...toEmails]);
      
        if (trimmed && emailRegex.test(trimmed) && !combinedEmailsSet.has(trimmed)) {
          combinedEmailsSet.add(trimmed);
          setInputEmail('');  // clear input after adding to send list
        }
      
        const combinedEmails = Array.from(combinedEmailsSet);


          const payload =  { 
            email_send_to: combinedEmails, 
            email_html: cleanedHtml,
            email_subject: emailSubject,
            email_type: selectedTemplate
          }
          
        try {
            const response = await axios.post(`${BASE_URL}/api/emailsender/`,
              payload,
              { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
              withCredentials: true,
            }  
            );
            
            if (response.status >= 200 && response.status <= 299) {
              message.success("Email sent successfully");
              console.log("Sending email to:", selectedStudents);
              console.log("Email content:", editorContent);
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
      styles={{ height: '600px', overflowY: 'auto' }}
    >
      {/* To field  */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">To:</label>
        <div className="flex flex-wrap gap-2 border border-gray-300 ">
          {toEmails.map((email) => (
            <span
              key={email}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1"
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
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                const trimmed = inputEmail.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (trimmed && emailRegex.test(trimmed) && !toEmails.includes(trimmed)) {
                  setToEmails([...toEmails, trimmed]);
                  setInputEmail("");
                }
              }
            }}
            placeholder="Add email here"
            className="flex-grow border-none outline-none"
          />
        </div>
      </div>
            {/* end  */}

            {/* input for subject  */}
            {/* <div className=''> */}
              <label htmlFor="Subject" className="block font-semibold mb-1">Subject:</label>
              <Input 
                placeholder="Subject" 
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="mb-4 border-gray-300 border-1 focus:border-blue-500 focus:ring-0"
              />
            {/* </div> */}



      <div className="flex flex-col md:flex-row gap-4 h-full">
        {/* Sidebar of templates */}
        <div className="md:w-1/4 w-full bg-gray-100 p-3 rounded overflow-y-auto h-full">
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
        <div className="md:w-3/4 w-full">
          <ReactQuill
            theme="snow"
            value={editorContent}
            onChange={setEditorContent}
            style={{ height: '550px', marginBottom: '40px' }}
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
