## CommentZu - Backend
CommentZu is a MERN stack comment system where users can create, view, like, and dislike comments in real time.

## Important Links
- Frontend live site:https://comment-zu-frontend.vercel.app/
- Backend live site: https://commentzu-backend.onrender.com

## Tech Stack / Packages
#### Backend
- MongodDB
- ExpressJS
- NodeJS
- Mongoose
- SocketIo
- Typescript
- JWT
- Bcrypt
- Cookie Parser
- Cors
- Dotenv
- Zod

#### Frontend
- ReactJS
- Socket.io-Client
- ShadcnUI
- TailwindCSS
- Zod
- React hook Form
- Axios
- React router dom
- Typescript


## .env Credential

Backend
```env
      NODE_ENV=development
      PORT=5000
      DATABASE_URL="mongodb+srv://commentzu-techzu:FUu0fX9JzRvklY7i@cluster0.svueayl.mongodb.net/commentzu"
      SALT_ROUNDS=12
      TOKEN_SECRET="secret_token"
      TOKEN_EXPIRE="30d"
```

Frontend
```env
      VITE_API_BASE_URL="https://commentzu-backend.onrender.com/api"
      VITE_API_SOCKET_URL="https://commentzu-backend.onrender.com"
```