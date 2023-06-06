# Final

## 準備
1. 申請 [IPFS key](https://www.infura.io/product/ipfs?utm_content=sitelink&utm_source=google&utm_medium=paidsearch&utm_campaign=Infura-Search-APAC-en-Brand-PHR&utm_term=infura%20ipfs&gad=1&gclid=CjwKCAjwpayjBhAnEiwA-7ena51bqKSS4Yf1ZaChV_79qPTmtTCYHLbNxEQTSuSGBT7qT4WDi5NOXRoCfkQQAvD_BwE)
2. 在 `frontend/` 及根目錄底下加 `.env` 內容如下
   ```
   REACT_APP_PROJECT_ID=[your API KEY]
   REACT_APP_PROJECT_SECRET=[your API KEY SECRET]
   ```
3. install (`/` and `/front`): `npm install`
4. backend:
    - `npx hardhat node` (會產生 20 組 wallet 後續測試可用)
    - `npx hardhat run scripts/deploy.js --network localhost`
    - `npx hardhat export-abi`
5. frontend:
    - cd frontend
    - `yarn start`
6. metamask:
    - `npx hardhat node` 會產生 20 組 wallet address/ private key
    - 點擊頭像 -> 匯入私鑰，即可新增測試用的 account

## 流程說明
*[介面顯示](https://docs.google.com/presentation/d/1HBRwTv65NyT9jDvwYVO95Xm_Nft_TiLRuIDa8iBr5cw/edit?usp=sharing)*
1. `localhost:3000/admin` : 以 `username: admin password: root12345` 登入，此時會綁定正在使用的 wallet address，未來登入時使用同個 wallet 即可
2. `localhost:3000/admin/home` : 
   1.  可以使用 `{[username: user1, password: password1, role: teacher], [username: user2, password: password2, role: student]}` 加入 user
   2.  還未綁定的帳號可用同一個 form 刪除
   3.  以 address 的方式加入其他 admin (其他 admin 用這個 wallet 即可直接登入)
   4.  可用 address 的方式刪除已綁定的 user
   5.  `Logout` 按鈕登出
3. `localhost:3000` : 
   1. 換一個新的 wallet 
   2. 以上面的加入的帳號登入
4. `localhost:3000/sign_up` : 
   1. 第一次成功登入後會需要填寫基本資料
   2. 可隨意填寫，但需要記住 student 的 Id
5. `localhost:3000/home` : 
   1. teacher: 表格可填寫科目、學期、student id、分數並送出，需要注意的是學生必須先登入綁定過 wallet
   2. student: 可以看到老師送出的成績資訊，以及 access key，access key 是用來給其他人查看成績的權限，並且可更新
6. `localhost:3000/search` :
   1. 任意人皆可到這個頁面
   2. 使用 student id, access key 即可得到該學生在某學期的成績
