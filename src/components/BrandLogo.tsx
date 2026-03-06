interface BrandLogoProps {
  sizeClassName?: string
  showName?: boolean
}

export function BrandLogo({ sizeClassName = 'h-14', showName = true }: BrandLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/norbu-logo.png"
        alt="Norbu logo"
        className={`${sizeClassName} w-auto object-contain`}
      />
      {showName && (
        <div>
          <p className="text-2xl font-bold leading-tight tracking-tight text-stone-800 dark:text-stone-100">Norbu</p>
          <p className="text-sm font-tibetan text-stone-400 dark:text-stone-500">ནོར་བུ</p>
        </div>
      )}
    </div>
  )
}
