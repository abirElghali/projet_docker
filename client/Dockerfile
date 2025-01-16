# Utiliser l'image officielle Node.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Installer un serveur HTTP pour servir l'app (nginx recommandé)
RUN npm install -g serve

# Exposer le port de l'application React
EXPOSE 3000

# Lancer l'application React
CMD ["serve", "-s", "build"]
