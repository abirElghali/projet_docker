FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier tout le code source
COPY . .

# Exposer le port sur lequel tourne le backend
EXPOSE 5000

# Lancer l'application
CMD ["npm", "start"]
