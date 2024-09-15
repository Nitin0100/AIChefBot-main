
import { Container, Col, Row } from 'react-bootstrap';
import RecipeCard from "@/components/RecipeCard";
import { useEffect, useState } from "react";

const RecipeCardList = ({ recipes, isSelectable = false, selectedRecipes = [], setSelectedRecipes, onUpdateAfterDelete }) => {
    const [savedRecipes, setSavedRecipes] = useState(recipes);
    useEffect(() => setSavedRecipes(recipes), [recipes]);

    useEffect(() => {
      if (isSelectable && setSelectedRecipes) {
        setSelectedRecipes(selectedRecipes);
      }
    }, [selectedRecipes, isSelectable, setSelectedRecipes])

    const handleOnDelete = (recipe) => {
        const updatedRecipes  = savedRecipes.filter((e) => e._id !== recipe._id);
        setSavedRecipes(updatedRecipes);
        if (onUpdateAfterDelete) {
          onUpdateAfterDelete(updatedRecipes); 
        }
    }

    const handleSelect = (recipe, isSelected) => {
      if (isSelected) {
          setSelectedRecipes(prevSelected => [...prevSelected, recipe]);
      } else {
          setSelectedRecipes(prevSelected => prevSelected.filter(r => r._id !== recipe._id));
      }
  };

    return (
        <Container className="animate__animated animate__fadeInUp">
            <Row>
              {savedRecipes &&
                savedRecipes.map((recipe, index) => (
                  <Col key={index} sm={12} md={6} lg={4} className="mb-4">
                    <RecipeCard
                        recipe={recipe}
                        onDelete={handleOnDelete}
                        onSelect={(isSelected) => handleSelect(recipe, isSelected)}
                        isSelected={selectedRecipes.some((r) => r._id === recipe._id)}
                        isSelectable={isSelectable}
                    />
                  </Col>
                ))}
            </Row>
        </Container>
    )
}

export default RecipeCardList;

