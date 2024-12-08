const fs = require("fs");

function generateKeyMatrix(keyword) {
    keyword = keyword.toUpperCase().replace(/J/g, "I"); // Replace J with I
    const seen = new Set(); // Keep track of unique letters
    const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // Alphabet excluding J
    const key = Array.from(keyword + alphabet).filter(
      (c) => !seen.has(c) && seen.add(c)
    ); // Build unique key
  
    const matrix = [];
    for (let i = 0; i < 25; i += 5) {
      matrix.push(key.slice(i, i + 5)); // Create 5x5 matrix
    }
    return matrix;
  }


  function encryptDigraph(pair, matrix) {
    let row1, col1, row2, col2;
    let found1 = false, found2 = false;
  
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (matrix[row][col] === pair[0]) {
          row1 = row;
          col1 = col;
          found1 = true;
        }
        if (matrix[row][col] === pair[1]) {
          row2 = row;
          col2 = col;
          found2 = true;
        }
      }
    }
  
    if (!found1 || !found2) {
      console.error(`Error: Pair ${pair} contains characters not in the matrix.`);
      return pair; // Return the original pair if not found
    }
  
    if (row1 === row2) {
      return [matrix[row1][(col1 + 1) % 5], matrix[row2][(col2 + 1) % 5]]; // Same row
    } else if (col1 === col2) {
      return [matrix[(row1 + 1) % 5][col1], matrix[(row2 + 1) % 5][col2]]; // Same column
    } else {
      return [matrix[row1][col2], matrix[row2][col1]]; // Rectangle swap
    }
  }
  

function findEncryptedText(w, final) {
  let ecnrypt = [];
  for (let i = 0; i < w.length; i++) {
    const e = encryptDigraph(w[i].split(""), final);
    ecnrypt.push(e.join(""));
  }
  return ecnrypt;
}

function findDigraphs(text) {
  text = text.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I"); // Clean and format text
  const digraphs = [];
  for (let i = 0; i < text.length; i += 2) {
    let pair = text.slice(i, i + 2);
    if (pair.length === 1) {
      pair += "X"; // Add X if single character
    } else if (pair[0] === pair[1]) {
      pair = pair[0] + "X"; // Handle repeated letters
      i--; // Adjust index
    }
    digraphs.push(pair);
  }
  return digraphs;
}

const data = "PLAYFAIR";
const final = generateKeyMatrix(data);

const reader = fs.createReadStream("example.txt");
let encryptedText = ""; // Buffer to store the chunks of data

// Collect chunks of data
reader.on("data", (chunk) => {
  encryptedText += chunk.toString();
});

// Process the data after the stream ends
reader.on("end", () => {
  const digraphs = findDigraphs(encryptedText);
  const encrypted = findEncryptedText(digraphs, final);

  // Collect metadata for non-alphabetic characters
  const metadata = [];
  for (let i = 0; i < encryptedText.length; i++) {
    const char = encryptedText[i];
    if (!/[A-Z]/i.test(char)) {
      metadata.push([i, char]);
    }
  }

  // Save the encrypted text and metadata to a file
  const output = `Encryptable: "${encrypted.join("")}"\nMetadata: ${JSON.stringify(metadata)}`;
  fs.writeFile("encrypted.txt", output, (err) => {
    if (err) {
      console.error("Error writing encrypted text to file:", err);
    } else {
      console.log("Encrypted text and metadata saved to encrypted.txt");
    }
  });
});

// Handle errors during the read process
reader.on("error", (err) => {
  console.error("Error reading the file:", err);
});
