      {/* Overlay-Container: position:fixed + zero-size. Die eigentlichen
          Overlay-Kinder (Backdrop, Drawer) leben chirurgisch hier drin —
          ein translate-x-full-Drawer direkt unter body würde trotz
          overflow:clip die Layout-Overflow-Breite von <html> aufblähen
          (Chrome zählt transformierte Positions-Boxen in scrollWidth). */}
      <div
        aria-hidden={!isSidebarOpen}
        className={`fixed inset-0 z-[60] ${isSidebarOpen ? '' : 'pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 h-dvh bg-background/70 backdrop-blur-sm transition-opacity duration-200 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* Sidebar Drawer */}
        <div
          id="site-menu-drawer"
          className={`absolute top-0 right-0 flex h-[100dvh] w-[85%] max-w-sm flex-col border-l border-border bg-surface transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : 'invisible translate-x-full opacity-0'
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <span className="mono-label text-primary">&gt;_ {translations.common.menu}</span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className={iconButtonClass}
              aria-label="Close Menu"
              type="button"
              tabIndex={isSidebarOpen ? undefined : -1}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4" aria-label={translations.common.menu}>
            <ul className="flex flex-col gap-2">
              {navLinks?.map((item, index) => (
                <li key={item.id || index}>
                  <Link
                    href={item.link}
                    className="group flex items-center justify-between rounded-[6px] border border-transparent px-3 py-3 text-base font-medium text-foreground transition-colors hover:border-border hover:bg-surface-raised"
                    onClick={() => setIsSidebarOpen(false)}
                    target={item.newTab ? '_blank' : undefined}
                    rel={item.newTab ? 'noopener noreferrer' : undefined}
                    tabIndex={isSidebarOpen ? undefined : -1}
                  >
                    <span>{item.label}</span>
                    <span className="mono-label text-muted-foreground transition-colors group-hover:text-primary">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-border p-4">
            <p className="mono-label text-muted-foreground">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
              Status · Available
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
