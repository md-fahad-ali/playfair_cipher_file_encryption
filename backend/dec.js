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
    return [matrix[row1][(col1 + 4) % 5], matrix[row2][(col2 + 4) % 5]];
  } else if (col1 === col2) {
    return [matrix[(row1 + 4) % 5][col1], matrix[(row2 + 4) % 5][col2]];
  } else {
    return [matrix[row1][col2], matrix[row2][col1]];
  }
}

const key = "PLAYFAIR";
const inputFile = "encrypted.txt";
const outputFile = "decrypted.txt";

// Decrypt the encrypted file
fs.readFile(inputFile, "utf8", (err, encryptedData) => {
  if (err) {
    console.error("Error reading encrypted file:", err);
    return;
  }

  const lines = encryptedData.split("\n");
  if (lines.length < 2) {
    console.error("Encrypted file format is incorrect. Expected at least two lines.");
    return;
  }

  const encryptedTextLine = lines[0];
  const metadataLine = lines[1];

  const encryptedTextMatch = encryptedTextLine.match(/"([^"]+)"/);
  if (!encryptedTextMatch) {
    console.error("Encrypted text line is not properly formatted with quotes.");
    return;
  }
  const encryptedText = encryptedTextMatch[1];

  const metadataMatch = metadataLine.match(/\[.*\]/);
  if (!metadataMatch) {
    console.error("Metadata line is not properly formatted as a JSON array.");
    return;
  }

  let metadata;
  try {
    metadata = JSON.parse(metadataMatch[0]);
  } catch (parseErr) {
    console.error("Error parsing metadata JSON:", parseErr);
    return;
  }

  if (!Array.isArray(metadata)) {
    console.error("Metadata is not an array.");
    return;
  }

  const matrix = generateKeyMatrix(key);

  let decryptedText = "";
  const digraphs = encryptedText.match(/.{1,2}/g) || []; // Split encrypted text into digraphs

  for (let digraph of digraphs) {
    if (digraph.length < 2) {
      // Handle odd-length digraphs by appending an 'X' or similar padding
      digraph += 'X';
    }
    const decryptedPair = decryptDigraph(digraph.split(""), matrix);
    decryptedText += decryptedPair.join("");
  }

  // Insert non-alphabetic characters back into the decrypted text
  let offset = 0;
  for (const entry of metadata) {
    if (Array.isArray(entry) && entry.length === 2) {
      const [index, char] = entry;
      if (typeof index === 'number' && typeof char === 'string') {
        decryptedText = decryptedText.slice(0, index + offset) + char + decryptedText.slice(index + offset);
        offset += char.length;
      } else {
        console.warn(`Invalid metadata entry: ${JSON.stringify(entry)}`);
      }
    } else {
      console.warn(`Invalid metadata format: ${JSON.stringify(entry)}`);
    }
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
