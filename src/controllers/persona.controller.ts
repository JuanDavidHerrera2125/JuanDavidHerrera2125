import { service } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,

  requestBody,

  response,
  HttpErrors,


} from '@loopback/rest';
import { llaves } from '../config1/llaves';
import {Credenciales, Persona} from '../models';
import {PersonaRepository} from '../repositories';
import { AutenticacionService } from '../services';
//import { RequestInfo, RequestInit } from 'node-fetch';
const fetch = require('node-fetch');
//const fetch = (url: RequestInfo, init?: RequestInit) =>
//import('node-fetch').then(({ default: fetch }) => fetch(url, init));



export class PersonaController {
  constructor(
    @repository(PersonaRepository)
    public personaRepository : PersonaRepository,
    @service(AutenticacionService)
    public servicioAutenticacion: AutenticacionService
  ) {}

  @post("/identificarPersona",{
  responses:{
    '200':{
      description:"Identificacion dde Usuarios"
    }
  }
})
async identificarPersona(
  @requestBody() credenciales : Credenciales
  ){

    let p = await  this.servicioAutenticacion.IdentificarPersona(credenciales.usuario, credenciales.clave)
    if (p){
      let token = this.servicioAutenticacion.GenerarTokenJWT(p);
      return {
        datos:{
          nombre: p.Nombre,
          correo: p.Correo,
          id: p.id

        },

        tk : token
      }

    }else{ throw new HttpErrors[401] ("Datos invalidos");
}
}



  @post('/personas')
  @response(200, {
    description: 'Persona model instance',
    content: {'application/json': {schema: getModelSchemaRef(Persona)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {
            title: 'NewPersona',
            exclude: ['id'],
          }),
        },
      },
    })
    persona: Omit<Persona, 'id'>,
  ): Promise<Persona> {

    let clave = this.servicioAutenticacion.GeneradorClave();
    let claveCifrada = this.servicioAutenticacion.CifrarClave(clave);
    persona.Clave = claveCifrada;
    let p = await this.personaRepository.create(persona);

    // Notificar al Usuario
    let destino = persona.Correo;
    let asunto = 'Registro en la Plataforma'
    let contenido = `Hola ${persona.Nombre}, su nombre de usuario es: ${persona.Correo} y su contraseña es: ${clave}.`;
    fetch(`${llaves.urlServicioNotificaciones}/envio-correo?correo_destino=${destino}&asunto=${asunto}&contenido=${contenido}`)
    .then((data:any) => {
      console.log(data);
    })
  return p;
  }

  @get('/personas/count')
  @response(200, {
    description: 'Persona model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Persona) where?: Where<Persona>,
  ): Promise<Count> {
    return this.personaRepository.count(where);
  }

  @get('/personas')
  @response(200, {
    description: 'Array of Persona model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Persona, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Persona) filter?: Filter<Persona>,
  ): Promise<Persona[]> {
    return this.personaRepository.find(filter);
  }

  @patch('/personas')
  @response(200, {
    description: 'Persona PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {partial: true}),
        },
      },
    })
    persona: Persona,
    @param.where(Persona) where?: Where<Persona>,
  ): Promise<Count> {
    return this.personaRepository.updateAll(persona, where);
  }

  @get('/personas/{id}')
  @response(200, {
    description: 'Persona model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Persona, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Persona, {exclude: 'where'}) filter?: FilterExcludingWhere<Persona>
  ): Promise<Persona> {
    return this.personaRepository.findById(id, filter);
  }

  @patch('/personas/{id}')
  @response(204, {
    description: 'Persona PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {partial: true}),
        },
      },
    })
    persona: Persona,
  ): Promise<void> {
    await this.personaRepository.updateById(id, persona);
  }

  @put('/personas/{id}')
  @response(204, {
    description: 'Persona PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() persona: Persona,
  ): Promise<void> {
    await this.personaRepository.replaceById(id, persona);
  }

  @del('/personas/{id}')
  @response(204, {
    description: 'Persona DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.personaRepository.deleteById(id);
  }
}
