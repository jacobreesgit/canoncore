'use client'

import { useState } from 'react'
import { IconButton } from './icon-button'

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
  disabled?: boolean
  error?: string
}

// Common emoji options for content types
const COMMON_EMOJIS = [
  '📄', '📝', '📖', '📚', '📰', '📋', '📊', '📈', '📉', '📌',
  '🎬', '🎥', '🎞️', '📺', '📻', '🎵', '🎶', '🎤', '🎧', '🎮',
  '🏆', '🎯', '🎨', '🖼️', '🎭', '🎪', '🎫', '🎟️', '🎲', '♠️',
  '👤', '👥', '👑', '🏠', '🏢', '🏛️', '🌍', '🌎', '🌏', '📍',
  '⚡', '🔥', '💡', '🔬', '🔭', '🧪', '💎', '🔑', '🗝️', '🎁',
  '📦', '📁', '🗂️', '🗃️', '🗄️', '📂', '🗓️', '📅', '📇', '📈'
]

export function EmojiPicker({ value, onChange, disabled = false, error }: EmojiPickerProps) {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div>
      <div className="flex items-center gap-2">
        <IconButton
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="w-12 h-12 border border-gray-300 rounded-md flex items-center justify-center text-2xl hover:bg-gray-50"
          disabled={disabled}
          aria-label="Toggle emoji picker"
        >
          {value}
        </IconButton>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="📄"
          disabled={disabled}
        />
      </div>
      
      {showPicker && (
        <div className="mt-2 p-3 border border-gray-200 rounded-md bg-gray-50 max-h-32 overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {COMMON_EMOJIS.map((emojiOption) => (
              <IconButton
                key={emojiOption}
                type="button"
                onClick={() => {
                  onChange(emojiOption)
                  setShowPicker(false)
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded"
                disabled={disabled}
                aria-label={`Select emoji ${emojiOption}`}
              >
                {emojiOption}
              </IconButton>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}