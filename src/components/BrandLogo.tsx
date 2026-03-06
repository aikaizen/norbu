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
          <p className="text-2xl font-semibold leading-tight tracking-tight">Norbu</p>
          <p className="text-sm text-stone-500 dark:text-stone-400">ནོར་བུ — jewel</p>
        </div>
      )}
    </div>
  )
}
