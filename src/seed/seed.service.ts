import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios;

  async executeSeed() {
    const response = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    response.data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/');
      const number = +segments[segments.length - 2];
    });

    return response.data;
  }
}
