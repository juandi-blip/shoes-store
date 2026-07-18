import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import InfoPage from './InfoPage'

function renderInfoPage(props = {}) {
  return render(
    <MemoryRouter>
      <InfoPage
        title={props.title ?? 'Título de prueba'}
        description={props.description ?? 'Descripción de prueba'}
        canonicalPath={props.canonicalPath ?? 'prueba'}
      >
        <p>Contenido de prueba</p>
      </InfoPage>
    </MemoryRouter>
  )
}

describe('InfoPage', () => {
  it('renderiza el título como <h1> y el contenido hijo', () => {
    renderInfoPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Título de prueba' })).toBeInTheDocument()
    expect(screen.getByText('Contenido de prueba')).toBeInTheDocument()
  })

  it('actualiza document.title vía useDocumentHead, agregando el sufijo de marca', () => {
    renderInfoPage({ title: 'Otro título' })
    expect(document.title).toBe('Otro título — Shoes Store')
  })
})
