const fs = require("fs");

function generateKeyMatrix(keyword) {
  keyword = keyword.toUpperCase().replace(/J/g, "I");
  const seen = new Set();
  const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
  const key = Array.from(keyword + alphabet).filter(
    (c) => !seen.has(c) && seen.add(c)
  );
  const matrix = [];
  for (let i = 0; i < 25; i += 5) {
    matrix.push(key.slice(i, i + 5));
  }
  return matrix;
}

function decryptDigraph(pair, matrix) {
  let row1, col1, row2, col2;

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (matrix[row][col] === pair[0]) {
        row1 = row;
        col1 = col;
      }
      if (matrix[row][col] === pair[1]) {
        row2 = row;
        col2 = col;
      }
    }
  }

  if (row1 === row2) {
    return [matrix[row1][(col1 + 4) % 5], matrix[row2][(col2 + 4) % 5]];
  } else if (col1 === col2) {
    return [matrix[(row1 + 4) % 5][col1], matrix[(row2 + 4) % 5][col2]];
  } else {
    return [matrix[row1][col2], matrix[row2][col1]];
  }
}

function formatText(data) {
  data = data
    .toUpperCase()
    .replace(/[^A-Z]/g, "") // Keep only letters
    .replace(/J/g, "I"); // Replace J with I

  const formattedText = [];
  for (let i = 0; i < data.length; i += 2) {
    let pair = data.slice(i, i + 2).split("");

    if (pair.length === 1) {
      pair.push("X"); // Add X if single character
    } else if (pair[0] === pair[1]) {
      pair[1] = "X"; // Handle repeated letters
      i--; // Adjust index
    }

    formattedText.push(pair.join(""));
  }

  return formattedText.join(" "); // Join with spaces for readability
}



const key = "YOURKEY";
const exampleFile = "example.txt";
const inputFile = "encrypted_copy.txt";
const outputFile = "decrypted.txt";

function decryptText(w, final) {
    let decrypted = [];
    for (let i = 0; i < w.length; i++) {
      const d = decryptDigraph(w[i].split(""), final);
      decrypted.push(d.join(""));
    }
    return decrypted;
  }

// Format and decrypt the text
fs.readFile(exampleFile, "utf8", (err, exampleData) => {
  if (err) {
    console.error("Error reading example file:", err);
    return;
  }

  const formattedText = formatText(exampleData);

  console.log("Formatted text from example.txt:");
  console.log(formattedText);

  // Now decrypt the encrypted file
  fs.readFile(inputFile, "utf8", (err, encryptedData) => {
    if (err) {
      console.error("Error reading encrypted file:", err);
      return;
    }

    const matrix = generateKeyMatrix(key);

    let decryptedText = "";
    const digraphs = encryptedData.match(/.{1,2}/g) || []; // Split encrypted text into digraphs

    for (let digraph of digraphs) {
      const decryptedPair = decryptDigraph(digraph.split(""), matrix);
      decryptedText += decryptedPair.join("");
    }

    // Save the decrypted text
    fs.writeFile(outputFile, decryptedText, (err) => {
      if (err) {
        console.error("Error writing decrypted text to file:", err);
      } else {
        console.log("Decrypted text saved to", outputFile);
      }
    });
  });
});
