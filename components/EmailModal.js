import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import { CognitoIdentityProviderClient, UpdateUserAttributesCommand } from "@aws-sdk/client-cognito-identity-provider";
import VerificationCodeModal from '@/components/VerificationCodeModal';

export default function EmailModal({ show, onHide, currentEmail }) {
   const {data: session} = useSession();
   const [currentEmailInput, setCurrentEmailInput] = useState('');
   const [newEmail, setNewEmail] = useState('');
   const [errorMessage, setErrorMessage] = useState('');
   const [showVerificationModal, setShowVerificationModal] = useState(false);
   const [email, setEmail] = useState('');
   

   const handleCurrentEmailInputChange = (e) => setCurrentEmailInput(e.target.value);

   const handleNewEmailChange = (e) => setNewEmail(e.target.value);

   const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

   const enhancedOnHide = () => {
      setCurrentEmailInput('');
      setNewEmail('');
      setErrorMessage('');
      onHide();
   };

   const handleSaveChanges = async () => {

      if (currentEmailInput !== currentEmail) {
         setErrorMessage('The current email does not match!');
         return; 
      }
      if (!emailRegex.test(newEmail)) {
         setErrorMessage('Not a valid email.');
         return;
      }

      const client = new CognitoIdentityProviderClient({ region: 'us-east-1'});

      console.log(session.user.accessToken)

      const input = {
         UserAttributes: [
            {
               Name: "email",
               Value: newEmail
            }
         ],
         AccessToken: session.user.accessToken,
      };

      try{
         const command = new UpdateUserAttributesCommand(input);
         const response = await client.send(command);

      setEmail(newEmail);
      setShowVerificationModal(true);
      enhancedOnHide();
      console.log("New Email to save:", newEmail);
      }catch(error){
         console.log('Error updating Email:', error);
      }
      
   };

      const verifyEmail = (code, email) => {
         console.log("Verification code:", code);
         console.log("New Email to save:", email);
   
         setShowVerificationModal(false); 
      };

   return (
     <>
       <Modal show={show} onHide={enhancedOnHide} centered>
         <Modal.Header closeButton>
           <Modal.Title>Edit Email Address</Modal.Title>
         </Modal.Header>
         <Modal.Body>
           <Form>
             {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
             <Form.Group controlId="formCurrentEmail">
               <Form.Label>Current Email</Form.Label>
               <Form.Control
                 type="email"
                 placeholder="Enter current email"
                 value={currentEmailInput}
                 onChange={handleCurrentEmailInputChange}
                 isInvalid={!!errorMessage}
               />
             </Form.Group>
             <Form.Group controlId="formNewEmail" className="mt-3">
               <Form.Label>New Email</Form.Label>
               <Form.Control
                 type="email"
                 placeholder="Enter new email"
                 value={newEmail}
                 onChange={handleNewEmailChange}
               />
             </Form.Group>
           </Form>
         </Modal.Body>
         <Modal.Footer>
           <Button variant="secondary" onClick={enhancedOnHide}>
             Close
           </Button>
           <Button variant="primary" onClick={handleSaveChanges}>
             Save Changes
           </Button>
         </Modal.Footer>
       </Modal>
       <VerificationCodeModal
         show={showVerificationModal}
         onHide={() => setShowVerificationModal(false)}
         verifyEmail={verifyEmail}
         newEmail={email}
       />
     </>
   );
}
