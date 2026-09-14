import { motion } from 'motion/react'

function Painting({
  id,
  title,
  image,
  onOpen,
  isSelected,
}) {
  function handleOpen(event) {
    const imageElement = event.currentTarget.querySelector('img')
    onOpen(imageElement)
  }

  return (
    <button
      type="button"
      className={`artwork-thumbnail ${
        isSelected ? 'artwork-thumbnail-selected' : ''
      }`}
      data-artwork-id={id}
      aria-label={`Open ${title}`}
      onClick={handleOpen}
    >
      <motion.img
        src={image}
        alt={title}
        whileHover={isSelected ? undefined : { scale: 1.04 }}
        whileTap={isSelected ? undefined : { scale: 0.98 }}
        transition={{
          duration: 0.25,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </button>
  )
}

export default Painting