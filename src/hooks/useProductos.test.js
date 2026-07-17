import { describe, it, expect } from 'vitest'
import { filtrarYOrdenarProductos } from './useProductos'

const sample = [
  { id: '1', nombre: 'Air Force 1', marca: 'Nike', precio: 115, genero: 'hombre', proposito: 'lifestyle', subcategoria: 'originals', novedad: false, outlet: false, tallas: [9], imagen: '' },
  { id: '2', nombre: 'Ultraboost', marca: 'Adidas', precio: 180, genero: 'mujer', proposito: 'running', subcategoria: 'performance', novedad: true, outlet: false, tallas: [8], imagen: '' },
  { id: '3', nombre: 'Zoom Freak', marca: 'Nike', precio: 95, genero: 'hombre', proposito: 'basketball', subcategoria: 'performance', novedad: false, outlet: true, tallas: [10], imagen: '' },
]

describe('filtrarYOrdenarProductos', () => {
  it('filtra por género', () => {
    const filtros = { generos: ['mujer'], categorias: [], precioMax: 300, soloOutlet: false, soloNovedad: false }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia')
    expect(result.map(p => p.id)).toEqual(['2'])
  })

  it('filtra por precio máximo', () => {
    const filtros = { generos: [], categorias: [], precioMax: 100, soloOutlet: false, soloNovedad: false }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia')
    expect(result.map(p => p.id)).toEqual(['3'])
  })

  it('filtra solo outlet', () => {
    const filtros = { generos: [], categorias: [], precioMax: 300, soloOutlet: true, soloNovedad: false }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia')
    expect(result.map(p => p.id)).toEqual(['3'])
  })

  it('filtra por categoría contra proposito o subcategoria', () => {
    const filtros = { generos: [], categorias: ['performance'], precioMax: 300, soloOutlet: false, soloNovedad: false }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia').map(p => p.id).sort()
    expect(result).toEqual(['2', '3'])
  })

  it('ordena por precio ascendente', () => {
    const filtros = { generos: [], categorias: [], precioMax: 300, soloOutlet: false, soloNovedad: false }
    const result = filtrarYOrdenarProductos(sample, filtros, 'precio-asc')
    expect(result.map(p => p.id)).toEqual(['3', '1', '2'])
  })

  it('relevancia prioriza novedades primero', () => {
    const filtros = { generos: [], categorias: [], precioMax: 300, soloOutlet: false, soloNovedad: false }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia')
    expect(result[0].id).toBe('2')
  })

  it('filtra por texto en el nombre (case-insensitive)', () => {
    const filtros = { generos: [], categorias: [], precioMax: 300, soloOutlet: false, soloNovedad: false, busqueda: 'ULTRABOOST' }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia')
    expect(result.map(p => p.id)).toEqual(['2'])
  })

  it('filtra por texto en la marca (case-insensitive)', () => {
    const filtros = { generos: [], categorias: [], precioMax: 300, soloOutlet: false, soloNovedad: false, busqueda: 'nike' }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia').map(p => p.id).sort()
    expect(result).toEqual(['1', '3'])
  })

  it('busqueda vacía no filtra nada', () => {
    const filtros = { generos: [], categorias: [], precioMax: 300, soloOutlet: false, soloNovedad: false, busqueda: '' }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia')
    expect(result).toHaveLength(sample.length)
  })

  it('busqueda ausente (undefined) no filtra nada', () => {
    const filtros = { generos: [], categorias: [], precioMax: 300, soloOutlet: false, soloNovedad: false }
    const result = filtrarYOrdenarProductos(sample, filtros, 'relevancia')
    expect(result).toHaveLength(sample.length)
  })
})
