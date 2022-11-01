import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import { repository } from '@loopback/repository';
import { Persona } from '../models';
import { PersonaRepository } from '../repositories';
import { llaves } from '../config1/llaves';
const generador = require("password-generator") ;
const cryptojs = require("crypto-js");
const jwt = require("jsonwebtoken");


@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(
    @repository (PersonaRepository)
    public PersonaRepository : PersonaRepository
  ) {   
  }
GeneradorClave(){
  let clave= generador(8,false);
  return clave;
}
CifrarClave(clave: string){
  let clavecifrada= cryptojs.MD5(clave).toString();
  return clavecifrada;
}

IdentificarPersona(usuario: string , clave: string){
  try {
 
     let p = this.PersonaRepository.findOne({where: {Correo : usuario , Clave : clave}});
     if (p){
      return p;
     } return false;

  }catch{
    return false;

  }
}

GenerarTokenJWT (persona : Persona){
  let token = jwt.sign({
    data:{
      id: persona.id,
      correo: persona.Correo,
      nombre: persona.Nombre + "" + persona.Apellido

    }
  },
  llaves.claveJWT);
  return token

}

ValidarTokenJWT(token : string){
  try{

    let datos = jwt.verify(token, llaves.claveJWT);
    return datos;

  }catch{
    return false;
  }
  

}

}
