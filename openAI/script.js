const OpenAI = require("openai");
const fs = require("fs");

const openai = new OpenAI();

async function main() {
  const ingredients = ['flour', 'sugar', 'butter', 'chocolate chips'];
  const prompt = `Generate three recipes using the following ingredients:\n- ${ingredients.join('\n- ')}.
In the JSON object, each recipe must contain the following properties:
name (string), ingredients (string array), ingredientQuantity (string array), steps (string array)
Use as few words as possible in each step, and do not number them.}`;

const completion = await openai.chat.completions.create({
    response_format:{ "type": "json_object" },
    messages: [{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo-1106",
});
console.log(prompt);

  let response = JSON.stringify(completion.choices[0]);
  fs.writeFileSync('output.json', response);

  console.log(response);
  
  console.log("Here are the recipes");
  const recipes = JSON.parse(response).message.content;
  console.log(recipes);
}

main();

