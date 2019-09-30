// GENERAL PURPOSE MIDDLEWARES
module.exports = {
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
  errorHandler: fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)
};
