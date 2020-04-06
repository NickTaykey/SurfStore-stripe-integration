function checkIfValidFile(input){
    for(let i = 0; i<input.files.length; i++){
        const matches = /\.(jpg|jpeg|png|gif)/g.exec(input.files[i].name);
        if(!matches) return false;
    }
    return true;
}