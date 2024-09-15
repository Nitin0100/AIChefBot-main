import { Modal, Button, Alert } from "react-bootstrap";
import { useSession } from "next-auth/react";

function DeleteAllRecipesModal({ show, onHide, recipes, onDeleteSuccess}) {
   const { data: session } = useSession();

   const enhancedOnHide = () => {
      onHide(); 
      onDeleteSuccess(); 

   };

   const removeImages = async (imageIds) => {
     console.log(`(DeleteAll) Removing images with ids: ${imageIds}`);

     try {
       const res = await fetch(`/api/images/request`, {
         method: "DELETE",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({ image_ids: imageIds }),
       });

       if (res.ok){
         console.log("(DeleteAll) Images deleted successfully")
       } else {
         console.error("(DeleteAll) Failed to delete images")
       }

     } catch (err) {
      console.error("(DeleteAll) Error deleting images:", err);
     }
   };

   const handleDeleteRecipes = async () => {

      const imageIds = recipes.filter(recipe => recipe.hasOwnProperty('image_id')).map(recipe => recipe.image_id);

      if (imageIds.length >= 1){
         removeImages(imageIds)
      }

      try {
      const res = await fetch(`/api/recipes/request`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({userId: session.user.id, recipeIds: recipes.map((recipe) => recipe._id),
        }),
      });

      if (res.ok) {
         console.log("(DeleteAll) Recipes deleted successfully from DeleteAllRecipesModal");
         enhancedOnHide();
      }else{
         console.error("(DeleteAll) Failed to delete recipes from DeleteAllRecipesModal");
      }

      } catch (err){
         console.error("(DeleteAll) Error removing recipes", err)
      }
   }

   return (
      <Modal show={show} onHide={enhancedOnHide} centered>
         <Modal.Header closeButton>
            <Modal.Title>Deleting All Recipes!</Modal.Title>
         </Modal.Header>
         <Modal.Body>
            <Alert variant="danger">
               Warning: you are about delete all your recipes this is irreversible. You will not be able
               to recover any of these recipes after deletion.
            </Alert>
         </Modal.Body>
         <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
               Cancel
            </Button>
            <Button
               variant="danger"
               onClick={handleDeleteRecipes}
            >
               Delete {recipes.length > 0 ? recipes.length : "No Recipes"} Recipes
            </Button>
         </Modal.Footer>
      </Modal>
   )
}

export default DeleteAllRecipesModal;