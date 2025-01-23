# Étape 1 : Construction avec Node.js
FROM node:lts AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers du projet dans le conteneur
COPY . .

# Installer les dépendances
RUN npm install

# Construire le site statique avec Astro
RUN npm run build

# Étape 2 : Servir les fichiers statiques avec Apache
FROM httpd:2.4 AS runtime

# Installer curl pour le healthcheck
RUN apt-get update && apt-get install -y curl wget && apt-get clean

# Copier les fichiers générés dans le dossier d'accueil d'Apache
COPY --from=build /app/dist /usr/local/apache2/htdocs/

# Exposer le port 80 pour servir les fichiers statiques
EXPOSE 80

# Définir un healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Commande par défaut pour démarrer Apache
CMD ["httpd-foreground"]
