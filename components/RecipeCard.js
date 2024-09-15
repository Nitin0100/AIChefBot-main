import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Badge, Form } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import { useRef } from 'react';
import generatePDF from 'react-to-pdf';
import { cacheSetSaved, cacheSetUnsaved } from '@/pages/api/sessionStorage';
import { useRouter } from 'next/router';

const RecipeCard = ({ recipe, onDelete, onSelect, isSelected, isSelectable }) => {
   const targetRef = useRef();
   const router = useRouter();

   const { data: session, status } = useSession();
   const [showModal, setShowModal] = useState(false);
   const [savedId, setSavedId] = useState(null);

   const handleClose = () => setShowModal(false);
   const handleShow = () => setShowModal(true);;

   useEffect(() => {
      if (recipe._id) {
         setSavedId(recipe._id);
      }
   }, [recipe]);

   const saveImage = async () => {
      const res = await fetch(`/api/images/request`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({imageURL: recipe.tempImageURL}),
      });

      const extractedData = await res.json();

      recipe.imageURL = extractedData.secure_url;
      recipe.image_id = extractedData.public_id;
   }
   const handleSavingRecipe = async (e) => {
      e.target.disabled = true;

      console.log(`Saving recipe: ${recipe.name}`)

      if (recipe.hasOwnProperty('tempImageURL')){
         await saveImage();
         console.log("updated recipe object", recipe);
      }
      const res = await fetch(`/api/recipes/request`, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({userId: session.user.id, recipe: recipe}),
       });
       const savedRecipe = await res.json();
       setSavedId(savedRecipe._id);
       cacheSetSaved(recipe, savedRecipe._id);
       setShowModal(false);
   }

   const removeImage = async (image_id) => {
      console.log(`Removing image with id: ${image_id}`);

      const res = await fetch(`/api/images/request`, {
         method: "DELETE",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({image_ids: [image_id]}),
      });

   }
   const handleRemoveRecipe = async(e) => {
      e.target.disabled = true;
      console.log(`Removing recipe: ${recipe.name}`);

      if (recipe.hasOwnProperty('image_id')){
         await removeImage(recipe.image_id);
      }
      await fetch(`/api/recipes/request`, {
         method: "DELETE",
         headers: {
            "Content-Type": "application/json"
         },
         body: JSON.stringify({userId: session.user.id, recipeIds: [savedId]}),
      })
      setSavedId(null);
      setShowModal(false);

      if (router.asPath == '/account/recipes') {
         onDelete(recipe);
      }
      cacheSetUnsaved(recipe);
   }

   const downloadPDF = () => {
      let e = document.getElementById('modal-footer')

      let filename = recipe.name.replaceAll(' ', '-');

      e.style.display='none';
      generatePDF(targetRef, {filename: `${filename}`});

      e.style.display='flex';
   }

   const handleSelectionChange = (e) => {
      e.stopPropagation(); 
      onSelect(!isSelected); 
   };
   
   return (
      <>
         {/* Users can select a recipe by also clicking on the recipe. */}
         <Card className={`recipe-card ${isSelectable && isSelected ? 'border-primary border-2' : ''}`} onClick={!isSelectable ? handleShow : handleSelectionChange}>
            { isSelectable && (
               <div style={{
                  position: 'absolute',
                  top: '15px',
                  left: '17px',
                  margin: 0,
                  transform: "scale(1.5)",
               }}>
                  {/* Check box to allow for users to select */}
                  <Form.Check
                     type="checkbox"
                     checked={isSelected}
                     onChange={(e) => handleSelectionChange(e)}
                     onClick={(e) => e.stopPropagation()}
                     className="recipe-select-checkbox"
                  />
               </div>
            )}
            <Card.Img className='recipe-card-img' variant="top" src={recipe.imageURL || recipe.tempImageURL || 'https://i.imgur.com/iTpOC92.jpeg'}/>
            <Card.Body className='p-3'>
               <Card.Title className='recipe-card-title mt-2'>{recipe.name}</Card.Title>
               {router.asPath == '/account/recipes' && recipe.created && 
                  <Badge className={"bg-success bg-opacity-75"}>
                     Created:&nbsp;
                     {new Date(recipe.created).toLocaleDateString()}
                  </Badge>}
               <hr className='recipe-card-line'/>
               <div className="ingredients-steps-count">
                  <span className="recipe-card-subtitle me-4">
                     <i className="fas fa-book"></i> 
                     <strong className='ms-2'>{recipe.ingredients.length ? recipe.ingredients.length : 0}</strong> Ingredients
                  </span>
                  <span className='recipe-card-subtitle'>
                     <i className="fas fa-utensils"></i> 
                     <strong className='ms-2'>{recipe.steps.length ? recipe.steps.length : 0}</strong> Steps
                     </span>
               </div>
               <Card.Subtitle className='recipe-card-subtitle mb-4 mt-3 text-muted'>
                  {recipe.description}
               </Card.Subtitle>
               {/* Added e.stopPropagation to stop from selecting the recipe. */}
               <Button variant='primary' onClick={(e) => {
                  if (isSelectable) e.stopPropagation();
                  handleShow();
               }} className='recipe-card-btn d-block mx-auto w-50 mb-2'>
                  View {savedId && <span>Saved</span>} Recipe
               </Button>
            </Card.Body>
         </Card>

         <Modal show={showModal} onHide={handleClose} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            {/* root of the PDF snapshot */}
            <section ref={targetRef}>
            <Modal.Header closeButton>
               <Modal.Title className='recipe-modal-title'>{recipe.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body ref={targetRef}>
               {/* The detailed recipe view goes here */}
               <h5>Ingredients:</h5>
               <ul className='text-muted'>
               {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
               ))}
               </ul>
               <h5>Steps:</h5>
               <ol className='text-muted'>
               {recipe.steps.map((step, index) => (
                  <li key={index}>{step}</li>
               ))}
               </ol>
            </Modal.Body>
            <Modal.Footer id="modal-footer">
            <Button variant="success" onClick={downloadPDF}><i className="fas fa-download"></i></Button>
               {status !== "unauthenticated" && (
                  savedId === null ? (
                  <Button variant='primary' onClick={e => handleSavingRecipe(e)}>
                     Save Recipe
                  </Button> 
                  ) : (
                  <Button variant='primary' onClick={e => handleRemoveRecipe(e)}>
                     Remove Recipe
                  </Button>
                  )
               )}
               <Button variant="secondary" onClick={handleClose}>
                  Close
               </Button>
            </Modal.Footer>
            </section>
         </Modal>
      </>
   );
};

export default RecipeCard;