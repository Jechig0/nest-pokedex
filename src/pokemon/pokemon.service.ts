import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    try{
      const pokemon = new this.pokemonModel({
      name: createPokemonDto.name.toLocaleLowerCase(),
      number: createPokemonDto.number,
    });
      return await pokemon.save();
    }
    catch(error: any){
      this.handleExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.pokemonModel.find()
      .skip(offset)
      .limit(limit)
      .sort({ number: 1 })
      .select('-__v');
  }

  async findOne(term: string): Promise<Pokemon> {
    let pokemon: Pokemon | null = null;
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ number: +term });
    }
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLocaleLowerCase().trim() });
    }

    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id, name or number ${term} not found`);
    }
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }

    await pokemon.updateOne(updatePokemonDto, { new: true });

    return { ...pokemon.toJSON(), ...updatePokemonDto };
  }

  async remove(id: string) {
    const result = await this.pokemonModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Pokemon with Mongo id ${id} not found`);
    }
    return result;
  }

  private handleExceptions(error: any) {
    if(error.code === 11000){
        throw new BadRequestException(`Pokemon already exists in the database ${JSON.stringify(error.keyValue)}`);
      }
    console.log(error);
    throw new InternalServerErrorException(`Error creating pokemon - Check server logs`);  
  }
}
