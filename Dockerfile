FROM node:lts-alpine AS builder 

WORKDIR /app

COPY package*.json ./

RUN npm install --production 

FROM node:lts-alpine # Use LTS Node.js for runtime stage

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules 
COPY . .

# Remove environment variables from Dockerfile (security best practice)
# Consider using environment files or secrets management tools

EXPOSE 3000 

CMD ["npm", "start"] 
