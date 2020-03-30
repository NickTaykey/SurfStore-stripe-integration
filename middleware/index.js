const Review = require("../models/review");
const User = require("../models/user");
const Post = require("../models/post");
const { cloudinary } = require("../cloudinary");
// da usare per il filto 'location' in searchAndFilter
const mapbox = require("@mapbox/mapbox-sdk/services/geocoding");
const geoCodeClient = mapbox({ accessToken: process.env.MAPBOX_TOKEN });

/* 
useremo questa funzione per sanitizare la stringa che l'utente ha messo nella barra di ricerca.
seleziona tutti i caratteri speciali (CHE SONO VALUTATI NELLE REGEXP) e ci mette un \ davanti in
modo che non vengano valutati ed eseguiti quando eseguiamo la regexp.
*/
function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
}

// GENERAL PURPOSE MIDDLEWARES
const middlewares = {
  /*
    MIDDLEWARE PER GESTIRE GLI ERRORI NEI CONTROLLERS, ESEGUE IL CODICE DEL CONTROLLER E SE CI SONO DEGLI
    ERRORI ESEGUE NEXT IL MIDDLEWARE PER LA GESTIONE DEGLI ERRORI BUILT-IN IN EXPRESS, ALTRIMENTI NON FA
    NIENTE
  */
  /* 
    middleware che prende come parametro il controller di cui deve gestire gli errori e, ritorna una funzione
    che esegue il controller, modella il suo flusso di esecuzione in una promessa (in cui pending è associato
    quando il codice è ancora in esecuzione, fulfilled quando l'esecuzione è stata completata con successo, e
    rejected quando non è potuta essere stata completata a causa di degli errori o di delle promesse fallite e
    non gestite) su questa promessa applichiamo un catch che scatterà in caso di rejection ed eseguirà il middleware
    per la gestione degli errori, non mettiamo nessun then in quanto se la promessa è completata con successo non
    vogliamo fare niente, in questo caso il codice è stato completato con successo e tutto è andato bene.
  */
  asyncErrorHandler(fn) {
    return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
  },
  // controlla se l'utente loggato ha creato la review in questione
  async checkReviewAuthor(req, res, next) {
    let review = await Review.findById(req.params.review_id);
    if (req.xhr || review.author.equals(req.user._id)) return next();
    req.session.error = "You are not authorized to update that review";
    res.redirect(`/posts/${req.params.id}/`);
  },
  // controlla se l'utente è loggato
  isLoggedIn(req, res, next) {
    // se l'utente è loggato esegue next
    if (req.xhr || req.isAuthenticated()) {
      return next();
    }
    // se nn è loggato redirige a login con un errore e l'url originale nella sessione
    req.session.error = "You have to be logged in to do that!";
    req.session.previousUrl = req.originalUrl;
    res.redirect("/login");
  },
  // controlla se l'utente autenticato è l'autore di un post
  async isAuthor(req, res, next) {
    let post = await Post.findById(req.params.id);
    // se l'utente è l'autore del post
    if (req.xhr || post.author.equals(req.user._id)) {
      // conserviamo il post nelle variabili dei template in modo da poter accederci direttamente senza
      // interagire con il DB
      res.locals.post = post;
      return next();
    }
    req.session.error = "Access denied";
    res.redirect("/posts");
  },
  // controlla se la password (attuale) che l'utente ha messo nel edit profile form è corretta (ci assicuriamo che sia autoriazato a modificare il profilo)
  async isValidPassword(req, res, next) {
    const { currentPassword } = req.body;
    const { user } = await User.authenticate()(
      req.user.username,
      currentPassword
    );
    // credenziali corrette PERMETTIAMO AL UTENTE DI AGGIORNARE IL PROFILO
    if (user) {
      res.locals.user = user;
      return next();
    }
    // settiamo un messaggio di errore di credenziali errate e reindiriziamo al form
    // cancelliamo l'immagine profilo uploadata per non sprecare spazio nel cloud
    middlewares.deleteProfileImage(req);
    req.session.error = "You have to provide the current password to update";
    res.redirect("profile");
  },
  // controlla se è stata passata una nuova password (se si la setta)
  async setNewPassword(req, res, next) {
    const { user } = res.locals;
    const { newPassword, passwordConfirmation } = req.body;
    // se la nuova pwd non c'è MESSAGGIO DI ERRORE
    if (newPassword && !passwordConfirmation) {
      // cancelliamo l'immagine profilo uploadata per non sprecare spazio nel cloud
      middlewares.deleteProfileImage(req);
      req.session.error = "missing password confirmation";
      return res.redirect("/profile");
    }
    // se sono state passate delle nuove password (vogliamo cambiarle)
    else if (newPassword && passwordConfirmation) {
      // se le password sono uguali le aggiorniamo ALTRIMENTI SOLLEVIAMO UN ERRORE
      if (newPassword === passwordConfirmation) {
        // aggiorniamo le password user.setPassword
        await user.setPassword(newPassword);
        return next();
      } else {
        // cancelliamo l'immagine profilo uploadata per non sprecare spazio nel cloud
        middlewares.deleteProfileImage(req);
        req.session.error = "the passwords have to match!";
        return res.redirect("/profile");
      }
    }
    // altrimenti andiamo avanti con i middleware
    next();
  },
  // middleware che eseguiamo in caso di errore per cancellare l'immagine del utente uploadata (SE C'E')
  async deleteProfileImage(req) {
    // se un immagine è stata uploadata
    if (req.file) {
      // la cancelliamo
      await cloudinary.v2.uploader.destroy(req.file.public_id);
    }
  },
  async validatePasswordResetToken(req, res, next) {
    const { token } = req.params;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: {
        $gt: Date.now()
      }
    });
    if (!user) {
      req.session.error = "Password reset token invalid or expired!";
      return res.redirect("/forgot-password");
    }
    res.locals.user = user;
    next();
  },
  /* assembla la query con cui cercare o filtrare i post (se l'utente ha inviato il form di ricerca in index)
  altrimenti questa query sarà {} (quella di default) . */
  async searchAndFilter(req, res, next) {
    /* in base ai valori dei campi specificati dal utente nel form (IN QUERY-STRING) POPOLEREMO L'ARRAY
    dbQueries CON LE VARIE QUERY CON I VALORI CHE L'UTENTE HA PASSATO NEL FORM IN MODO DA SELEZIONARE
    SOLO I POSTS CHE RISPETTANO I CRITERI DI SELEZIONE SPECIFICATI DAL UTENTE. */
    const dbQueries = [];
    // controlliamo se sono stati passati dei valori in url-query-string (DOBBIAMO ASSEMBLARE LA QUERY O NO)
    // troviamo le chiavi dei valori passati in url-query-string
    const keys = Object.keys(req.query);
    // se sono stati passati dei valori in url-query-string IL FORM E' STATO INVIATO
    if (keys.length) {
      // destrutturiamo i valori associati ai vari campi del form passati in query-string
      let { search, location, distance, price, avgRating } = req.query;

      // se è stata specificata una 'stringa chiave' con cui selezionare i post nel DB
      if (search) {
        /* 
        componiamo la query per selezionare solo i posts che contengono la stringa in questione
        può essere contenuta in diversi campi : TITOLO, DESCRIZIONE, LOCALITA'
        LA CERCHIAMO USANDO UN REGEX 
        
        PRIMA SANITIZIAMO LA STRINGA IN MODO DA METTERE \ DAVANTI AD OGNI CARATTERE SPECIALE CHE POTREBBE
        MODIFICARE IL FUNZIONAMENTO DELLA REGEX (portare a errori o a risultati errati)
        */
        // creiamo la regex di ricerca con la stringa chiave sanitizata (globale e case-insensitive)
        search = new RegExp(escapeRegExp(search), "gi");
        // METTIAMO LA QUERY NEL ARRAY
        dbQueries.push({
          // se il post contiene search in title o in description o in location allora selezioniamo il post
          $or: [
            { title: search },
            { description: search },
            { location: search }
          ]
        });
      }

      // controlliamo se la località è definita
      if (location) {
        // metteremo le coordinate in questa variabile
        let coordinates;
        try {
          /* 
          il valore di location (che arrivati a questo punto non può essere vuoto)
          sarà: 
          
          - un oggetto JSON (array) con le coordinate del utente nel caso abbia usato la funzionalità di geoLocation
            nel form
          - una stringa con il nome della location di riferimento nel caso in cui l'utente l'abbia specificata manualmente 
          
          AL INTERNO DI QUESTO TRY CERCHIAMO SI CONVERTIRE L'OGGETTO JSON location in un array che contiene le coordinate
          (metodo JSON.parse ) nel caso in cui tutto vada bene vuol dire che location era un array in formato JSON con le
          coordinate (ce le abbiamo già) NON SERVE CHIAMARE L'API DI MAPBOX PER TROVARE LE COORDINATE DEL LUOGO

          SE CI DA UN ERRORE (location non è un array JSON con le coordinate del luogo) allora l'utente ha inserito il nome 
          (l'idrizzo o un codice postale nel input location) allora dobbiamo trovare le coordinate usando mapbox

          CON QUESTA LOGICA, QUALSIASI COSA L'UTENTE INSERISCA NEL FORM CI RITROVEREMO SEMPRE NELLA SITUAZIONE IN CUI
          ABBIAMO LE COORDINATE DEL LUOGO DI RIFERIMENTO NELLA VARIABILE coordinates
          */
          coordinates = JSON.parse(location);
        } catch (error) {
          // troviamo le coordinate della località
          let response = await geoCodeClient
            .forwardGeocode({ query: location, limit: 1 })
            .send();
          coordinates = response.body.features[0].geometry.coordinates;
        }
        // console.log(coordinates);
        // convertiamo la distanza del form in metri (mongodb lavora in metri,
        // in questo modo abbiamo risultati coerenti con il valore in miglia)
        distance = distance || 25;
        distance *= 1609.34;
        // console.log(distance / 1609.34, coordinates);
        // creiamo la query e mettiamo la query nel array
        dbQueries.push({
          /* usiamo l'operatore $near (che fa uso del indice $2dsphere per controllare le coordinate dei
          post più velocemente) per selezionare tutti i posts la cui distanza dal luogo passato dal utente
          (coordinates) è minore (uguale) a quella specificata dal utente (o 25 che è il valore di default) */
          geometry: {
            $near: {
              /* con l'operatore $geometry settiamo il luogo di riferimente (la cui distanza con quello del
              post è comparata) SARA' UN OGGETTO GEOJSON che indica un punto type: "Point", che ha coordinate
              quelle del luogo di riferimento (coordinates) */
              $geometry: {
                type: "Point",
                coordinates
              },
              /* settiamo la distanza massima del luogo del post con quello di riferimente usando $maxDistance
              (IN QUESTO MODO VENGONO SELEZIONATI SOLO I POST LA CUI DISTANZA E' AL MASSIMO (minore o uguale)
              ) QUELLA SPECIFICATA */
              $maxDistance: distance
            }
          }
        });
      }
      // controlliamo se il prezzo è definito
      if (price) {
        // controlliamo se il prezzo minimo è definito -> selezioniamo tutti i post con quel prezzo minimo
        if (price.min) dbQueries.push({ price: { $gte: price.min } });
        // facciamo lo stesso per il massimo
        if (price.max) dbQueries.push({ price: { $lte: price.max } });
        /* in questo modo l'utente può specificare o il minimo o il massimo o entrambi (anche nessuno) 
        ottenendo post filtrati come vuole in base ai prezzi passati */
      }
      // controlliamo se il avgRating è definito
      if (avgRating) {
        // selezioniamo i posts che hanno come valore di avgRating uno di quelli nel array avgRating (il valore
        // che l'utente ha specificato è un array, in quanto poteva filtrare i valori di avgRating dei post usando
        // un form con delle checkbox selezionando più valori in base a quale selezionare i posts)
        dbQueries.push({
          // selezioniamo i posts il cui avgRating nel array di quelli che l'utente ha settato nel form
          avgRating: {
            $in: avgRating
          }
        });
        // console.log(dbQueries[0], avgRating);
      }

      /* ora che abbiamo controllato tutti i campi del form (potenzialmente composto una query)
      la query vera e propria, per interrogare il DB (adesso abbiamo solo un array di query separate che
      dobbiamo unire) 
      
      
      controlliamo se è stata composta una query (se l'utente nn ha inivato il form o è qui x chè aveva
      page in url-query-string sarà una query vuota -> seleziona tutti i posts )
      
      dato che la query deve essere passata al controller che la eseguirà la mettiamo in res.locals 
     
      SE LA QUERY È STATA ASSEMBLATA (L'ARRAY DBQUERIES HA DEGLI ELEMENTI) uniamo ogni singola query del
      array usando l'operatore $and, in modo da comporre una query che SELEZIONA SOLO I POSTS CHE RISPETTANO
      TUTTE LE QUERY passate a questo operatore (a cui passiamo un array di query -> dbQueries)
      ALTRIMENTI GLI PASSIAMO UNA QUERY {} SELEZIONA TUTTI I POSTS DAL DB
      */
    }
    res.locals.dbQuery = dbQueries.length ? { $and: dbQueries } : {};

    /* vogliamo mantenere lo stato del form anche dopo che è stato inviato, mettiamo query come variabile
    ejs in modo da poter accedere ai valori di ogni campo del form */
    res.locals.query = req.query;
    /* 
    creiamo gli url di paginazione (url che saranno settati come valore del attributo href nei link del
    partial paginatePosts), questi avranno in base alla situazione (paginiamo sia i risultati di una ricerca
    che tutti i posts mostrati) la pagina in query string ed eventualmente i dati del form (solo il primo nel
    caso paginiamo tutti i posts e anche il secondo nel caso paginiamo solo i risultati di una ricerca)
     
    QUINDI CAPIAMO IN CHE CONTESTO DI TROVIAMO:
    
    IL FORM È STATO INVIATO (PAGINARE RISULTATI DI UNA RICERCA) -> i link hanno in query string i dati del form
    -> la pagina è separata da questi ultimi da un & (query string già iniziata)

    IL FORM NON E' STATO INIVATO (PAGINARE TUTTI I POSTS) -> i link hanno i query string solo il numero della pagina
    con davanti il ? (fa iniziare la query string)

    per capire in che caso ci troviamo, eliminiamo page dal array keys (chiavi di req.query)

    - se la lunghezza è > 0 il form è stato iniviato (ci sono i dati del form in query string)
    - altrimenti non è stato inviato il form (non ci sono altri dati oltre a page in query string)

    eliminiamo page dal array
    */
    keys.splice(keys.indexOf("page"), 1);
    // in base al caso in cui ci troviamo settiamo il delimitatore (& o ?) che deve essere messo prima di page in query string
    const delimiter = keys.length ? "&" : "?";
    /* creiamo gli url di paginazione partendo dagli url (originali con anche i dati in query string che sono
    stati passati in questa richiesta), rimuoviamo page dalla stringa (per evitare errori quando metteremo il nostro placeholder
    senza valore di page) ed aggiungiamo il placeholder con il delimitatore (NOTA, la situazione in termini di valori
    in query string degli url per quanto riguarda il delimitatore è quella che abbiamo stabilito scegliendolo, quindi il nostro
    delimitatore funzionerà) IL VALORE DELLA PAGINA SARA' POI AGGIUNTO DAL PARTIAL*/
    res.locals.paginateUrl =
      req.originalUrl.replace(/(\?|\&)page=\d+/g, "") + `${delimiter}page=`;

    // console.log(res.locals.query);
    // eseguiamo il controller
    next();
  }
};

module.exports = middlewares;
