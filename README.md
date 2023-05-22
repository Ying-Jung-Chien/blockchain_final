# HW8

## 準備
1. 申請 [IPFS key](https://www.infura.io/product/ipfs?utm_content=sitelink&utm_source=google&utm_medium=paidsearch&utm_campaign=Infura-Search-APAC-en-Brand-PHR&utm_term=infura%20ipfs&gad=1&gclid=CjwKCAjwpayjBhAnEiwA-7ena51bqKSS4Yf1ZaChV_79qPTmtTCYHLbNxEQTSuSGBT7qT4WDi5NOXRoCfkQQAvD_BwE)
2. 在 `frontend/` 及根目錄底下加 `.env` 內容如下
   ```
   REACT_APP_PROJECT_ID=[your API KEY]
   REACT_APP_PROJECT_SECRET=[your API KEY SECRET]
   ```
3. install: `npm install`
4. backend:
    - `npx hardhat node`
    - `npx hardhat run scripts/deploy.js --network localhost`
    - 將終端機印出的三個地址，分別更改到 `frontend/src/abi/contracts/Account.sol(Score.sol, Transcript.sol)/contract-address.json`
    - `npx hardhat export-abi`
5. frontend:
    - cd frontend
    - `yarn start`

## 說明

1. deploy 的時候會有三組帳號，如下:
    ```
    [
    { username: "user1", password: "password1", role: "admin", id: "012345" },
    { username: "user2", password: "password2", role: "teacher", id: "123456" },
    { username: "user3", password: "password3", role: "student", id: "234567" },
    ]
    ```
2. teacher 可以給 student 評分，student 收到評分後可以申請成績單，admin 會審查申請是否符合標準
3. 打開 `http://localhost:3000` 後會需要登入，測試流程如下:

    1. 先用 `username: "user2", password: "password2"` 登入，並且輸入課程名稱，學生學號(234567)及分數後送出，此處可新增多筆
    2. 登入 `username: "user3", password: "password3"`，按下 `Apply Transcript` 按鈕
    3. 登入 `username: "user1", password: "password1"`，會顯示原始資料，並且驗證 teacher 的簽名，admin 可以按下通過或拒絕申請的按鈕。(此部分 smart contract 已寫好，但來不及接前端)
