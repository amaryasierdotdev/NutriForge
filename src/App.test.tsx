import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('Body Recomposition Calculator', () => {
  test('renders calculator title', () => {
    render(<App />)
    const titleElement = screen.getByText(/Body Recomp/i)
    expect(titleElement).toBeInTheDocument()
  })

  test('renders form inputs', () => {
    render(<App />)
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/weight/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/height/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument()
  })

  test('renders generate analysis button', () => {
    render(<App />)
    const button = screen.getByRole('button', { name: /generate analysis/i })
    expect(button).toBeInTheDocument()
  })

  test('renders dark mode toggle', () => {
    render(<App />)
    const toggleButton = screen.getByRole('button', { name: /switch to light mode/i })
    expect(toggleButton).toBeInTheDocument()
  })
})