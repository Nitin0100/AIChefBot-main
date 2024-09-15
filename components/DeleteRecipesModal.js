import { Modal, Button, Alert } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { cacheClearSavedAll } from "@/pages/api/sessionStorage";

function DeleteRecipesModal({ show, onHide, recipes, onDeleteSuccess }) {
   const { data: session, status } = useSession();

   const enhancedOnHide = () => {
      onHide(); 
      onDeleteSuccess(); 
   };

   const removeImages = async (imageIds) => {
     console.log(`Removing images with ids: ${imageIds}`);

     try {
       const res = await fetch(`/api/images/request`, {
         method: "DELETE",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({ image_ids: imageIds }),
       });

       if (res.ok){
         console.log("Images deleted successfully")
       } else {
         console.error("Failed to delete images")
       }

     } catch (err) {
      console.error("Error deleting images:", err);
     }
   };

   const handleDeleteRecipes = async () => {
      
      const imageIds = recipes.filter(recipe => recipe.hasOwnProperty('image_id')).map(recipe => recipe.image_id);

      if (imageIds.length > 0){
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
         cacheClearSavedAll(recipes);
         console.log("Recipes deleted successfully");
         enhancedOnHide();
      }else{
         console.error("Failed to delete recipes");
      }

      } catch (err){
         console.error("Error removing recipes", err)
      }
   }

   return (
      <Modal show={show} onHide={enhancedOnHide} centered>
         <Modal.Header closeButton>
            <Modal.Title>Delete {recipes.length} Recipes</Modal.Title>
         </Modal.Header>
         <Modal.Body>
            <Alert variant="danger">
               Warning: Deleting these recipes is irreversible. You will not be able
               to recover any of these recipes after deletion.
            </Alert>
         </Modal.Body>
         <Modal.Footer>
            <Button variant="secondary" onClick={enhancedOnHide}>
               Cancel
            </Button>
            <Button
               variant="danger"
               onClick={handleDeleteRecipes}
            >
               Delete {recipes.length} Recipes
            </Button>
         </Modal.Footer>
      </Modal>
   )
}

export default DeleteRecipesModal;