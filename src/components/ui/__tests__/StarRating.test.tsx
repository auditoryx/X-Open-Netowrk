/** @jest-environment jsdom */
import React from 'react'
import { createRoot } from 'react-dom/client'
import StarRating from '../StarRating'

describe('StarRating keyboard interactions', () => {
  test('arrow keys change rating', () => {
    const div = document.createElement('div')
    const root = createRoot(div)
    let rating = 1
    root.render(<StarRating value={rating} onChange={(r) => (rating = r)} />)
    const star = div.querySelectorAll('[role="radio"]')[0] as HTMLElement
    star.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(rating).toBe(2)
    star.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    expect(rating).toBe(1)
  })

  test('space or enter selects rating', () => {
    const div = document.createElement('div')
    const root = createRoot(div)
    let rating = 0
    root.render(<StarRating value={rating} onChange={(r) => (rating = r)} />)
    const third = div.querySelectorAll('[role="radio"]')[2] as HTMLElement
    third.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(rating).toBe(3)
    third.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    expect(rating).toBe(3)
  })
})
