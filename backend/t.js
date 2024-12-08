const fs = require("fs");

function createPlayfairMatrix(key) {
  const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
  const keyUpper = key
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .replace("J", "I");
  const uniqueKey = Array.from(new Set(keyUpper + alphabet));
  const matrix = [];

  for (let i = 0; i < 25; i += 5) {
    matrix.push(uniqueKey.slice(i, i + 5));
  }

  return matrix;
}

function findPosition(matrix, char) {
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (matrix[row][col] === char) return [row, col];
    }
  }
  return null;
}

function prepareTextForEncryption(text) {
  const cleanedText = text
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase()
    .replace("J", "I");
  return cleanedText.length % 2 === 0 ? cleanedText : cleanedText + "X";
}

function encryptPlayfair(matrix, text) {
  let result = "";
  for (let i = 0; i < text.length; i += 2) {
    const [row1, col1] = findPosition(matrix, text[i]);
    const [row2, col2] = findPosition(matrix, text[i + 1]);

    if (row1 === row2) {
      result += matrix[row1][(col1 + 1) % 5] + matrix[row2][(col2 + 1) % 5];
    } else if (col1 === col2) {
      result += matrix[(row1 + 1) % 5][col1] + matrix[(row2 + 1) % 5][col2];
    } else {
      result += matrix[row1][col2] + matrix[row2][col1];
    }
  }
  return result;
}

function decryptPlayfair(matrix, text) {
  if (text.length % 2 !== 0) {
    throw new Error("Encrypted text length must be even for decryption.");
  }

  let result = "";
  for (let i = 0; i < text.length; i += 2) {
    const [row1, col1] = findPosition(matrix, text[i]);
    const [row2, col2] = findPosition(matrix, text[i + 1]);

    if (row1 === row2) {
      result += matrix[row1][(col1 + 4) % 5] + matrix[row2][(col2 + 4) % 5];
    } else if (col1 === col2) {
      result += matrix[(row1 + 4) % 5][col1] + matrix[(row2 + 4) % 5][col2];
    } else {
      result += matrix[row1][col2] + matrix[row2][col1];
    }
  }
  return result;
}

function encryptFile(key, inputFile, outputFile) {
  const matrix = createPlayfairMatrix(key);
  const content = fs.readFileSync(inputFile, "utf8");
  const text = prepareTextForEncryption(content);
  const encrypted = encryptPlayfair(matrix, text);

  const nonAlphaMap = content.split("").map((char, idx) => ({
    char,
    index: /[^A-Za-z]/.test(char) ? idx : null,
  }));

  const saveData = JSON.stringify({ encrypted, nonAlphaMap });
  fs.writeFileSync(outputFile, saveData);
  console.log(`Encrypted text saved to ${outputFile}`);
}

function decryptFile(key, inputFile) {
  const matrix = createPlayfairMatrix(key);
  const { encrypted, nonAlphaMap } = JSON.parse(
    fs.readFileSync(inputFile, "utf8")
  );
  const decrypted = decryptPlayfair(matrix, encrypted);

  let restored = decrypted.split("");
  nonAlphaMap.forEach(({ char, index }) => {
    if (index !== null) {
      restored.splice(index, 0, char);
    }
  });

  let result = restored.join("").toLowerCase();
  result = result.replace(/(^\s*\w|[.!?]\s*\w)/g, (match) =>
    match.toUpperCase()
  );

  console.log("Decrypted text:", result);
  return result;
}

// const key = "MONARCHY";
// const inputFile = "example.txt";
// const outputFile = "en.txt";

// encryptFile(key, inputFile, outputFile);
// decryptFile(key, outputFile);


module.exports = {
  createPlayfairMatrix,
  encryptPlayfair,
  decryptPlayfair,
  encryptFile,
  decryptFile,
};
