require('dotenv').config();

const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const iconv = require('iconv-lite');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

async function uploadToS3(filePath, bucketName, folderName) {
  const fileContent = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const params = {
    Bucket: `${bucketName}/${folderName}`,
    Key: fileName,
    Body: fileContent
  };

  const data = await s3.upload(params).promise();
  console.log(`File uploaded successfully. ${data.Location}`);

  return data.Location;
}

async function saveToDatabase(fileName, s3Url) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const query = process.env.QUERY;
  const values = [fileName, s3Url];

  await connection.execute(query, values);
  console.log('File information saved to database.');

  await connection.end();
}

async function readCSV() {
  const filePath = process.env.FILE_PATH;
  const firstColumnValues = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(iconv.decodeStream('euc-kr'))
      .pipe(csv())
      .on('data', (row) => {
        firstColumnValues.push(row[Object.keys(row)[0]]); // 각 행의 첫 번째 열 값 추가 (파일 형식에 따라 변동 가능)
      })
      .on('end', () => {
        console.log('파일 읽기 완료');
        resolve(firstColumnValues);
      })
      .on('error', (error) => {
        console.error('파일 읽기 중 오류 발생:', error);
        reject(error);
      });
  });
}

async function checkFileExistence(filePath) {
  return new Promise((resolve, reject) => {
      fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
              console.log(`${filePath} 파일이 존재하지 않습니다.`);
              resolve(false);
          } else {
              //console.log(`${filePath} 파일이 존재합니다.`);
              resolve(true);
          }
      });
  });
}

async function main() {
  try {
    const firstColumnValues = await readCSV();
    const fileFormat = 'jpg';

    for (const value of firstColumnValues) {
      const filePath = process.env.IMG_FOLDER_NAME + `/${value}.${fileFormat}`;

      const s3Url = await uploadToS3(filePath, process.env.BUCKET_NAME, process.env.BUCKET_FOLDER_NAME);
      await saveToDatabase(path.basename(filePath), s3Url);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
