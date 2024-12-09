const express = require("express");
const router = express.Router();
const axios = require("axios");

// API details

const category = "inspirational";

const apiUrl = `https://api.api-ninjas.com/v1/quotes?category=${category}`;

router.get("/", async (req, res) => {
  try {
    const response = await axios.get(apiUrl, {
      headers: { "X-Api-Key": process.env.API_KEY },
    });

    // Log the response data for debugging
    console.log("API Response:", response.data);

    // Extract quote and author from the response
    const quoteData = response.data[0];
    const quote = quoteData?.quote || "Stay inspired!";
    const author = quoteData?.author || "Unknown";

    console.log("Rendered Data:", { quote, author });

    // Render the index template with the fetched data
    res.render("index", {
      title: "Aspire",
      quote,
      author,
    });
  } catch (error) {
    console.error("Error fetching quote:", error.message);

    // Render the index template with an error message
    res.render("index", {
      title: "Aspire",
      quote: "An error occurred while fetching the quote.",
      author: "",
    });
  }
});

module.exports = router;
