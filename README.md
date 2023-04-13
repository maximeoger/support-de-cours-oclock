# Support de cours pour l'école Oclock

## Prérequis

Pour suivre ce cours, vous aurez besoin d'avoir le client postgresql installé sur votre ordinateur Linux ou MacOs 

```shell
# linux
sudo apt update
sudo apt install postgresql
sudo systemctl start postgresql.service

# mac
brew install postgresql
brew services start postgresql

# Lancer le client postgres en mode root (superuser)
psql postgres
```

## 1 Creation de la base de données POSTGRESQL et du rôle d'administrateur

Maintenant que le client postgresql est installé, vous aurez besoin de créer un rôle d'utilisateur (admin) différent "root". Car utiliser l'utilisateur root c'est toujours une source potentielle de problèmes pour la sécurité de vos données 😊.

```sql
CREATE ROLE admin WITH LOGIN PASSWORD 'password';

ALTER ROLE admin CREATEDB;
```

Ici on a donc créé le rôle admin avec le mot de passe `password`, on lui a attribué le rôle `CREATEDB` pour lui permettre de créer la base de données.

```shell
# On se déconnecte de l'utilisateur root
postgres=# \q
```

```shell
# Puis on se reconnecte avec notre nouvel utilisateur admin
psql -d postgres -U admin
```

```shell
# On peut maintenant créer notre base de données pour le projet
CREATE DATABASE api;
```

#### Liste des commandes du client psql

| Commande  | Effet                                       |
| --------- | ------------------------------------------- |
| `\list`   | Liste les tables                            |
| `\q`      | Quitter le client psql                      |
| `\c`      | Connexion à une nouvelle base de données    |
| `\dt`     | Affiche toutes les tables                   |
| `\du`     | Affiche tous les rôles                      |



## 2 Creation de la table user et ajout de deux entrées

- Maintenant que la base de données est créee, on peut créer une table qui servira à contenir les users

```sql
CREATE TABLE users (
  ID SERIAL PRIMARY KEY,
  name VARCHAR(30),
  email VARCHAR(30)
);
```

- On ajoute deux nouvelles entrées dans la table

```sql
INSERT INTO users (name, email)
  VALUES ('cadillac', 'cadillac@lecrou.fr'), ('popip','popip@lecrou.fr');
```

## 3 Création d'un serveur node avec koa js

```shell
mkdir stupeflip-api
cd stupeflip-api
```

- On crée un fichier *package.json* à la racine de notre projet via `yarn init -y` (toutes les commandes yarn fonctionnent aussi avec un équivalent npm)

Parfait, maintenant que le fichier package.json est créé, on peut ajouter les dépendances. Les dépendances sont des modules la plupart du temps open source (c'est à dire maintenus et versionnés par un ou plusieurs développeurs), stockés sur le dépot distant npm. Si on a besoin d'utiliser un de ses modules, on peut le télécharger dans notre projet grace à la commande `yarn add <nom-du-module>`

```shell
  yarn add koa koa-body koa-router pg dotenv
```
- **Koa** est un framework web développé par l'équipe derrière expressJS. Il se veut plus simple, plus léger que son grand frêre
- **koa-body** est un module qui va nous permettre d'analyser le body des requettes HTTP envoyés au serveur via la méthode `POST`
- **koa-router** est un module qui permet de gérer les endpoints de notre serveur
- **pg** est le client node qui nous permettra de communiquer avec la base de données postgresql
- **dotenv** est un module qui permet de lire le contenu des fichiers .env (plus d'infos après)

Ensuite on crée un dossier `src/`. Le but de ce dossier est de contenir tout le code de notre projet. On crée ensuite un fichier `index.js` à la racine de src. Dans lequel on ajoute le code suivant :

```JavaScript
  // On importe les dépendances
  const Koa = require('koa')
  const { koaBody } = require('koa-body')

  const app = new Koa() // On crée une nouvelle instance de Koa que l'on stock dans une variable app

  // On défini les middlewares
  app.use(koaBody())

  // on démarre le serveur en local sur le port 3000. Pour le moment il est accessible seulement sur votre machine
  app.listen(3000)
```

## 4 Création d'une interface pour interagir avec la base de données

Maintenant que le serveur est créé, il nous faut une solution pour permettre à notre serveur node de communiquer avec node base de données `api`. Pour ca on va avoir besoin de créer un fichier .env à la racine de notre projet qui contiendra les informations de connexion nécessaire pour le client pg qu'on a installé plus tôt.

```shell 
touch .env
```

```env
  DB_USERNAME='me' # Le nom de notre base de données
  DB_HOST='localhost' # L'hôte de la base de données (ici localhost)
  DB_NAME='api' # Le nom de la base de données
  DB_PASSWORD='password' # Le mot de passe
  DB_PORT='5432' # Et le port (par défaut, le service postgres utilise le port 5432)
```

Ensuite on crée un nouveau fichier dans `src/utils/database/connectionPool.js` :

```JavaScript
// On importe les modules
const Pool = require('pg').Pool
const dotenv = require('dotenv')

// On appelle dotenv.config() pour récupérer les variables dans le fichier .env
dotenv.config()

// ce qui nous permet d'y accéder depuis process.env
const { DB_USERNAME, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT } = process.env

// On initialise un Pool de connexion à notre base de données que l'on stock dans une variable
const pool = new Pool({
    user: DB_USERNAME,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT
})

// Et on exporte cette variable afin de pouvoir y accéder depuis d'autres endroits de l'application
module.exports = pool
```

## 5 Création des routes et des controlleurs

Pour permettre aux utilisateurs de notre projet d'utiliser la base de données depuis notre serveur koa, on a besoin de créer des routes. Ce sont des urls HTTP exposés par le serveur. Une route va avoir cette forme :

`[GET] http://localhost:3000/users`

- `GET` est ce qu'on appelle un verbe http. GET est utilisé pour récupérer des informations sur un serveur (ici des utilisateurs stockés en base de donnée) il en existe d'autres avec des fonctions différentes (POST, PATCH, PUT, DELETE, ETC) mais ce sera l'objet d'un prochain cours 😉

- `http://` est le protocole utilisé par cette requette. Ici http donc. Normalement il est mieux d'utiliser le protocole https qui ajoute une couche dite `ssl` par dessus. Mais pour rester focaliser sur l'essentiel, nous utiliseront http pour le moment.

- `localhost` est le domaine de la requette. Etant donné que notre serveur tourne sur un réseau local, on utilise localhost (ce qui équivaut à utiliser l'addresse IP 127.0.0.1).

- `:3000` est le port attribué à notre serveur (souvenez vous, nous avions utilisé le port 3000)

- `/users` est ce qu'on appelle l'endpoint de la route. C'est une partie de l'url qui indique que l'on se situe sur la partie de notre serveur qui gère les utilisateurs (users)

Après cette petite parenthese théorique, place à la pratique. Nous allons donc créer un nouveau fichier dans `src/controllers/users/index.js` :

```JavaScript
// On importe notre Pool de connexion
const dbConnection = require('../../utils/database/connectionPool')

// Ici on déclare une fonction (asyncrone) pour récupérer les utilisateurs dans notre base de données.
// Cette fonction prends un paramètre ctx qui sera donné par le serveur Koa
async function getUsers(ctx) {

  // Ici le résultat sera stocké dans une variable résults sous la forme d'une promesse 
  let results = await dbConnection.query('SELECT * FROM users ORDER BY id ASC')

  // Une fois que le résultat est arrivé, on définie le code 200 dans le status de la réponse pour indiquer que tout c'est bien passé
  ctx.status = 200
  // Et on renvoie les données dans le body de la réponse au formant JSON
  ctx.body = JSON.stringify({
    count: results.rowCount,
    data: results.rows
  })
}

// Même chose pour la création d'utilisateur. Sauf que cette fois c'est un peu différent
async function createUser (ctx) {
  // Ici on s'attends à recevoir des informations depuis la requette (Et oui pour créer un utilisateur, on a besoin d'avoir ses infos !)
  const { name, email } = ctx.request.body

  // On insert les infos dans la base de données avec une clause INSERT INTO
  await dbConnection.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email])

  // Ici on spécifie 201 pour indiquer que tout s'est bien passé (par convention, 201 est utilisé dans les requettes de type POST)
  ctx.status = 201
  ctx.body = `Created new user with email ${email}`
}

// On exporte le module avec les deux méthodes définies au dessus
module.exports = {
  getUsers,
  createUser
}
```

On a terminé de créer les fonctions, mais tant qu'on ne les appelles pas, elles ne serviront pas à grand chose 😅
Pour remédier à ça on va créer un autre fichier dans `src/routes/users.js` 

```JavaScript
// On importe le module koa-router et notre controller
const router = require('koa-router')()
const controller = require('../controllers/user')

// On définie une route GET sur l'endpoint /users et on lui passe la methode getUsers (ici l'objet ctx sera passé à la fonction automatiquement)
// Cette route nous permettra de récupérer nos utilisateurs
router.get('/users', controller.getUsers)

// Pour /user, on spécifie une requette POST. Elle nous servira à créer un utilisateur 
router.post('/user', controller.createUser)

// On export le routeur pour pourvoir le greffer à notre serveur koa
module.exports = router
```

