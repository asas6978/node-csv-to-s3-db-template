# node-csv-to-s3-db-template
## 동작 순서
1. csv 파일에 저장되어 있는 jpg 파일 이름 불러오기
2. 불러온 파일 이름으로 jpg 파일 탐색
3. 이미지가 존재하는 경우 S3에 jpg 파일 저장 및 url 반환
4. jpg 파일 정보 및 url을 MySQL DB 내 테이블에 저장

## 프로젝트 구조
```
- root
ㄴ images
ㄴ imagesName.csv
ㄴ uploadTemplate.js
ㄴ .env
```
- `images`: .jpg 파일들이 담겨있는 폴더
- `imagesName.csv`: .jpg 파일 이름이 저장되어 있는 csv 파일
- `.env`: uploadTemplate.js의 환경 변수 값 지정
  (이미지 폴더나 csv 파일 이름 등 따로 명시 필요)

## 사용 방법
Node.js 및 npm이 설치되어 있는 환경이어야 합니다.
1. 프로젝트 디렉토리로 이동
2. 필요한 npm 패키지 설치
  ```sh
  npm install aws-sdk mysql2 fs path csv-parser iconv-lite dotenv
  ```
3. .env 파일 생성 및 환경 변수 설정
  ```env
  AWS_ACCESS_KEY_ID=your-access-key-id
  AWS_SECRET_ACCESS_KEY=your-secret-access-key

  DB_HOST=your-db-host
  DB_PORT=your-db-port
  DB_USER=your-db-user
  DB_PASSWORD=your-db-password
  DB_NAME=your-db-name
  
  BUCKET_NAME=your-s3-bucket-name
  BUCKET_FOLDER_NAME=your-s3-folder-name

  FILE_PATH=path/to/your/csv/file.csv
  IMG_FOLDER_NAME=your-image-folder-name

  QUERY=INSERT INTO YOUR_TABLE (title, img_url) VALUES (?, ?)
  ```
4. js 파일 실행
  ```sh
  node your-script-file.js
  ```
