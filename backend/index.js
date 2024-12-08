const fs = require("fs");

// // const writer = fs.createWriteStream("product.jpg");

// // reader.on("data", function (chunk) {
// //   writer.write(chunk);
// // });

// // reader.on("end", function () {
// //   console.log("Image file copied successfully!");
// // });

// // reader.on("error", function (err) {
// //   console.error("Error reading the file:", err);
// // });

// // writer.on("error", function (err) {
// //   console.error("Error writing the file:", err);
// // });

// function generateKeyMatrix(keyword) {
//   keyword = keyword.toUpperCase().replace(/J/g, "I");
//   const seen = new Set();
//   const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
//   const key = Array.from(keyword + alphabet).filter(
//     (c) => !seen.has(c) && seen.add(c)
//   );
//   const matrix = [];
//   for (let i = 0; i < 25; i += 5) {
//     matrix.push(key.slice(i, i + 5));
//   }
//   return matrix;
// }

// function encryptDigraph(pair, matrix) {
//   let row1, col1, row2, col2;

//   for (let row = 0; row < 5; row++) {
//     for (let col = 0; col < 5; col++) {
//       if (matrix[row][col] === pair[0]) {
//         row1 = row;
//         col1 = col;
//       }
//       if (matrix[row][col] === pair[1]) {
//         row2 = row;
//         col2 = col;
//       }
//     }
//   }

//   if (row1 === row2) {
//     return [matrix[row1][(col1 + 1) % 5], matrix[row2][(col2 + 1) % 5]];
//   } else if (col1 === col2) {
//     return [matrix[(row1 + 1) % 5][col1], matrix[(row2 + 1) % 5][col2]];
//   } else {
//     return [matrix[row1][col2], matrix[row2][col1]];
//   }
// }

// function findDiagraph(data) {
//   const text = [];
//   data = data.toUpperCase().replace(/[^A-Z]/g, "");
//   //   console.log("data", data);
//   for (let i = 0; i < data.length; i += 2) {
//     const tt = data.slice(i, i + 2).split("");

//     if (tt.length === 1) {
//       //   console.log("before tt", tt);
//       tt.push("X");
//       //   console.log("after tt", tt);
//     } else if (tt[0] === tt[1]) {
//       //   console.log("before tt", tt);
//       tt[1] = "X";
//       //   console.log("after tt", tt);
//       i--;
//     }

//     text.push(tt.join(""));
//   }

//   return text;
// }

// function findEncryptedText(w, final) {
//   let ecnrypt = [];
//   for (let i = 0; i < w.length; i++) {
//     const e = encryptDigraph(w[i].split(""), final);
//     ecnrypt.push(e.join(""));
//   }
//   return ecnrypt;
// }

// const data = "PLAYFAIR";
// const final = generateKeyMatrix(data);

// const plain_text = `In the vast expanse of human history, technological evolution has shaped the way societies grow and thrive. From the invention of the wheel to the development of quantum computing, every innovation is a testament to human ingenuity. The digital age, in particular, represents an era where the fusion of hardware and software has transcended physical boundaries, connecting people across the globe instantaneously. The internet, a modern marvel, has become both a repository of collective knowledge and a platform for expression, enabling individuals to share their stories, dreams, and innovations.Parallel to this technological revolution is the eternal presence of nature, a stark reminder of the world's origins. Towering mountains, flowing rivers, and lush forests embody resilience, much like the unyielding spirit of humanity. The symbiotic relationship between humans and nature often seems paradoxical—while we rely on nature for sustenance and inspiration, our actions sometimes lead to its degradation. The quest for sustainability, therefore, has emerged as a global imperative, urging us to adopt renewable energy, conserve resources, and live harmoniously with the environment.Parallel to this technological revolution. `;
// const reader = fs.createReadStream("example.txt");
// reader.on("data", (chunk) => {
//   console.log(chunk.toString());
// });
// const w = findDiagraph(plain_text);
// const ecnrypted = findEncryptedText(w, final);
// console.log(ecnrypted.join(""));

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
    return [matrix[row1][(col1 - 1 + 5) % 5], matrix[row2][(col2 - 1 + 5) % 5]];
  } else if (col1 === col2) {
    return [matrix[(row1 - 1 + 5) % 5][col1], matrix[(row2 - 1 + 5) % 5][col2]];
  } else {
    return [matrix[row1][col2], matrix[row2][col1]];
  }
}

// function decryptText(w, final) {
//   let decrypted = [];
//   for (let i = 0; i < w.length; i++) {
//     const d = decryptDigraph(w[i].split(""), final);
//     decrypted.push(d.join(""));
//   }
//   return decrypted;
// }

// const keyword = "PLAYFAIR";
// const matrix = generateKeyMatrix(keyword);

// const test = findEncryptedText(w, final);
// const decryptedDigraphs = decryptText(test, matrix);

// console.log(decryptedDigraphs.join(""));

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


function cleanDecryptedText(decrypted) {
  let cleanedText = "";

  for (let i = 0; i < decrypted.length; i++) {
    if (decrypted[i] === "X") {
      if (i === 0 || decrypted[i - 1] !== decrypted[i + 1]) {
        cleanedText += decrypted[i];
      }
    } else {
      cleanedText += decrypted[i];
    }
  }

  return cleanedText.trim().toLowerCase();
}

function decryptText(w, final) {
  let decrypted = [];
  for (let i = 0; i < w.length; i++) {
    const d = decryptDigraph(w[i].split(""), final);
    decrypted.push(d.join(""));
  }
  return decrypted;
}

function restoreFormatting(originalText, decryptedText) {
  let formattedText = "";
  let index = 0;
  let capitalizeNext = true;

  for (let char of originalText) {
    if (/[A-Za-z]/.test(char)) {
      if (capitalizeNext) {
        formattedText += decryptedText[index].toUpperCase();
        capitalizeNext = false;
      } else {
        formattedText += decryptedText[index];
      }
      index++;
    } else {
      formattedText += char;
      if (char === "." || char === "!" || char === "?") {
        capitalizeNext = true;
      }
    }
  }

  return formattedText;
}

const output = fs.createReadStream("encrypted.txt");
let decryptedText = ""; // Buffer to store the chunks of data

// Collect chunks of data
output.on("data", (chunk) => {
  decryptedText += chunk.toString();
});

const keyword = "PLAYFAIR";

const matrix = generateKeyMatrix(keyword);

// Process the data after the stream ends
output.on("end", () => {
  // console.log(decryptedText);
  const cleanedDecryptedText = cleanDecryptedText(
    decryptText(decryptedText, matrix).join("")
  );
  const restoredText = restoreFormatting(decryptedText, cleanedDecryptedText);

  console.log("Decrypted Text:", restoredText);

  // Save the encrypted text to a file
  fs.writeFile("output.txt", restoredText, (err) => {
    if (err) {
      console.error("Error writing encrypted text to file:", err);
    } else {
      console.log("Encrypted text saved to encrypted.txt");
    }
  });
});

// Handle errors during the read process
output.on("error", (err) => {
  console.error("Error reading the file:", err);
});

// const originalPlainText = `In the vast expanse of human history, technological evolution has shaped the way societies grow and thrive. From the invention of the wheel to the development of quantum computing, every innovation is a testament to human ingenuity. The digital age, in particular, represents an era where the fusion of hardware and software has transcended physical boundaries, connecting people across the globe instantaneously. The internet, a modern marvel, has become both a repository of collective knowledge and a platform for expression, enabling individuals to share their stories, dreams, and innovations. Parallel to this technological revolution is the eternal presence of nature, a stark reminder of the world's origins. Towering mountains, flowing rivers, and lush forests embody resilience, much like the unyielding spirit of humanity. The symbiotic relationship between humans and nature often seems paradoxical—while we rely on nature for sustenance and inspiration, our actions sometimes lead to its degradation. The quest for sustainability, therefore, has emerged as a global imperative, urging us to adopt renewable energy, conserve resources, and live harmoniously with the environment.`;

// const cleanedDecryptedText = cleanDecryptedText(decryptText(test, matrix).join(""));
// const restoredText = restoreFormatting(originalPlainText, cleanedDecryptedText);

// console.log(restoredText);
