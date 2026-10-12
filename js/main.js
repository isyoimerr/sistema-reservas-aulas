const initDashboardInteractions = () => {
    const storedTheme = localStorage.getItem('appTheme') || 'claro';
    const storedFontScale = Number(localStorage.getItem('appFontScale')) || 16;
    const themeCycle = ['claro', 'azul', 'oscuro'];
    const minFontScale = 14;
    const maxFontScale = 20;

    const normalizeSearchText = (value) => (value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    const applyTheme = (theme) => {
        const resolvedTheme = themeCycle.includes(theme) ? theme : 'claro';
        document.body.dataset.theme = resolvedTheme;
        localStorage.setItem('appTheme', resolvedTheme);

        const selector = document.getElementById('themeSelector');
        if (selector) {
            selector.value = resolvedTheme;
        }
    };

    const setTextScale = (nextScale) => {
        const safeScale = Math.min(maxFontScale, Math.max(minFontScale, Number(nextScale) || 16));
        document.documentElement.style.fontSize = `${safeScale}px`;
        localStorage.setItem('appFontScale', String(safeScale));
    };

    const cycleTheme = () => {
        const currentTheme = document.body.dataset.theme || storedTheme;
        const currentIndex = themeCycle.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themeCycle.length;
        applyTheme(themeCycle[nextIndex]);
    };

    applyTheme(storedTheme);
    setTextScale(storedFontScale);

    const searchableTargets = () => document.querySelectorAll('.stat-card, .panel-card, .summary-item, .mini-action, .data-table tbody tr, .searchable-item, .profile-panel');

    const applySearchFilter = (value) => {
        const query = normalizeSearchText(value);
        const allTargets = searchableTargets();

        allTargets.forEach((element) => {
            const text = normalizeSearchText(element.dataset.searchKey || element.textContent || '');
            const shouldShow = !query || text.includes(query);
            element.style.display = shouldShow ? '' : 'none';
        });
    };

    document.querySelectorAll('input[type="search"], input[aria-label="Buscar dentro del panel"]').forEach((searchInput) => {
        searchInput.addEventListener('input', (event) => {
            applySearchFilter(event.target.value);
        });
    });

    document.querySelectorAll('#avatarInput').forEach((input) => {
        input.addEventListener('change', (event) => {
            const file = event.target.files && event.target.files[0];
            if (!file) return;

            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            const validType = allowedTypes.includes(file.type);
            const maxBytes = 2 * 1024 * 1024;
            if (!validType || file.size > maxBytes) {
                window.alert('Sube una imagen JPG, PNG o WEBP de hasta 2 MB. Recomendado: 400×400 px.');
                input.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const preview = document.getElementById('avatarPreview');
                if (preview) preview.src = loadEvent.target.result;
            };
            reader.readAsDataURL(file);
        });
    });

    const sidebarMenu = document.getElementById('sidebarMenu');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileSidebarButton = document.getElementById('mobileSidebarToggle') || document.querySelector('.mobile-sidebar-toggle');
    const existingBackdrop = document.querySelector('.dashboard-backdrop');
    const backdrop = existingBackdrop || document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'dashboard-backdrop';
    backdrop.setAttribute('aria-label', 'Cerrar menú');
    if (!existingBackdrop) {
        document.body.appendChild(backdrop);
    }

    const syncMobileToggleButton = (isOpen) => {
        if (!mobileSidebarButton) return;

        const icon = mobileSidebarButton.querySelector('i');
        mobileSidebarButton.style.display = window.innerWidth < 640 ? 'flex' : 'none';
        mobileSidebarButton.setAttribute('aria-expanded', String(isOpen));
        mobileSidebarButton.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');

        if (icon) {
            icon.classList.toggle('bi-list', !isOpen);
            icon.classList.toggle('bi-x-lg', isOpen);
        }
    };

    const setSidebarState = (isOpen) => {
        if (!sidebarMenu) return;

        const openState = Boolean(isOpen);
        const isMobile = window.innerWidth < 640;

        if (isMobile) {
            sidebarMenu.classList.remove('is-collapsed');
            sidebarMenu.classList.toggle('is-open', openState);
            sidebarMenu.setAttribute('aria-expanded', String(openState));
        } else {
            sidebarMenu.classList.toggle('is-collapsed', !openState);
            sidebarMenu.classList.remove('is-open');
            sidebarMenu.setAttribute('aria-expanded', String(openState));
        }

        if (sidebarToggle) {
            sidebarToggle.setAttribute('aria-expanded', String(openState));
            const icon = sidebarToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('bi-chevron-left', openState && !isMobile);
                icon.classList.toggle('bi-chevron-right', !openState && !isMobile);
                icon.classList.toggle('bi-list', isMobile);
            }
        }

        syncMobileToggleButton(isMobile ? openState : false);
        backdrop.classList.toggle('is-visible', isMobile && openState);
        localStorage.setItem('sidebarOpen', String(openState));
    };

    const ensureMobileToggle = () => {
        if (!sidebarMenu || !mobileSidebarButton) return;

        if (window.innerWidth >= 640) {
            mobileSidebarButton.style.display = 'none';
            return;
        }

        const isOpen = sidebarMenu.classList.contains('is-open') || localStorage.getItem('sidebarOpen') === 'true';
        syncMobileToggleButton(isOpen);
    };

    if (sidebarMenu) {
        const savedValue = localStorage.getItem('sidebarOpen');
        const isMobile = window.innerWidth < 640;
        const savedSidebarOpen = isMobile ? false : (savedValue === null ? true : savedValue === 'true');
        setSidebarState(savedSidebarOpen);

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                const isMobile = window.innerWidth < 640;
                const isOpen = isMobile ? sidebarMenu.classList.contains('is-open') : !sidebarMenu.classList.contains('is-collapsed');
                setSidebarState(!isOpen);
            });
        }

        if (mobileSidebarButton) {
            mobileSidebarButton.addEventListener('click', () => {
                const isOpen = sidebarMenu.classList.contains('is-open') || sidebarMenu.getAttribute('aria-expanded') === 'true';
                setSidebarState(!isOpen);
            });
        }

        backdrop.addEventListener('click', () => {
            setSidebarState(false);
        });

        window.addEventListener('resize', () => {
            const openState = localStorage.getItem('sidebarOpen') === 'true';
            setSidebarState(window.innerWidth < 640 ? openState : true);
            ensureMobileToggle();
        });

        ensureMobileToggle();
    }

    const banner = document.querySelector('.system-banner');
    const footer = document.querySelector('.app-footer');
    const footerCloseButton = document.querySelector('.bottom-bar-close');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const drawerClose = document.querySelector('.drawer-close');
    const drawerBackdrop = document.querySelector('.drawer-backdrop');

    const setDrawerState = (isOpen) => {
        if (!mobileDrawer) return;
        mobileDrawer.classList.toggle('is-open', isOpen);
        document.body.classList.toggle('drawer-open', isOpen);
        if (mobileMenuToggle) {
            mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
        }
    };

    if (window.innerWidth <= 640) {
        let touchStartX = 0;
        let touchStartY = 0;
        let lastTapTime = 0;
        let pinchStartDistance = null;
        let lastFontScale = Number(localStorage.getItem('appFontScale')) || 16;

        const getTouchDistance = (touchA, touchB) => {
            const dx = touchA.clientX - touchB.clientX;
            const dy = touchA.clientY - touchB.clientY;
            return Math.hypot(dx, dy);
        };

        document.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1) {
                const touch = event.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
                const now = Date.now();
                if (now - lastTapTime < 300) {
                    cycleTheme();
                    lastTapTime = 0;
                } else {
                    lastTapTime = now;
                }
            }

            if (event.touches.length === 2) {
                pinchStartDistance = getTouchDistance(event.touches[0], event.touches[1]);
                lastFontScale = Number(localStorage.getItem('appFontScale')) || 16;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (event) => {
            if (event.touches.length === 2 && pinchStartDistance) {
                const currentDistance = getTouchDistance(event.touches[0], event.touches[1]);
                const delta = currentDistance - pinchStartDistance;
                if (Math.abs(delta) > 12) {
                    const nextScale = Math.round((lastFontScale + delta / 10) * 10) / 10;
                    setTextScale(nextScale);
                }
            }
        }, { passive: true });

        document.addEventListener('touchend', (event) => {
            if (event.changedTouches.length === 1 && !event.touches.length) {
                const touch = event.changedTouches[0];
                const deltaX = touch.clientX - touchStartX;
                const deltaY = touch.clientY - touchStartY;

                if (Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (deltaX > 0) {
                        setDrawerState(true);
                        if (sidebarMenu && window.innerWidth < 640) {
                            sidebarMenu.classList.add('is-open');
                        }
                    } else {
                        setDrawerState(false);
                        if (window.history.length > 1) {
                            window.history.back();
                        }
                    }
                }
            }

            pinchStartDistance = null;
        }, { passive: true });
    }

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            const isOpen = !mobileDrawer?.classList.contains('is-open');
            setDrawerState(isOpen);
        });
    }

    if (drawerClose) {
        drawerClose.addEventListener('click', () => setDrawerState(false));
    }

    if (drawerBackdrop) {
        drawerBackdrop.addEventListener('click', () => setDrawerState(false));
    }

    if (footerCloseButton && footer) {
        footerCloseButton.addEventListener('click', () => {
            footer.classList.add('is-hidden');
        });
    }

    const utilityData = {
        notifications: [
            { title: 'Reserva pendiente', text: 'La reserva de laboratorio 2 requiere aprobación del coordinador.', time: 'Hace 5 min' },
            { title: 'Aula en mantenimiento', text: 'El aula 204 quedó reservada para revisión técnica.', time: 'Hace 27 min' },
            { title: 'Cambio de horario', text: 'Se modificó la programación del bloque de matemáticas.', time: 'Hace 1 h' }
        ],
        messages: [
            { title: 'Coordinación docente', text: 'Se confirmó la reunión de horarios para este viernes.', time: 'Hace 12 min' },
            { title: 'Soporte académico', text: 'La solicitud de la docente fue atendida correctamente.', time: 'Hace 46 min' }
        ]
    };

    const utilityPanel = document.getElementById('utilityPanel');
    const utilityPanelBody = document.getElementById('utilityPanelBody');
    const utilityPanelTitle = document.getElementById('utilityPanelTitle');
    const utilityClose = document.querySelector('.utility-panel-close');
    const utilityButtons = document.querySelectorAll('[data-panel]');

    const renderUtilityPanel = (type) => {
        if (!utilityPanel || !utilityPanelBody || !utilityPanelTitle) return;

        const items = utilityData[type] || [];
        utilityPanelTitle.textContent = type === 'messages' ? 'Mensajes' : 'Notificaciones';
        utilityPanelBody.innerHTML = items.map((item) => `
            <article class="utility-item">
                <strong>${item.title}</strong>
                <p>${item.text}</p>
                <time>${item.time}</time>
            </article>
        `).join('') || '<div class="utility-item"><strong>Sin novedades</strong><p>No hay mensajes pendientes en este momento.</p><time>Ahora</time></div>';
    };

    if (utilityButtons.length) {
        utilityButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const panelType = button.dataset.panel;
                const isOpen = utilityPanel && utilityPanel.classList.contains('is-open');
                const isSamePanel = utilityPanel && utilityPanel.dataset.panel === panelType;

                utilityButtons.forEach((item) => item.classList.toggle('is-active', item === button && !isSamePanel));

                if (!utilityPanel) return;

                if (isOpen && isSamePanel) {
                    utilityPanel.classList.remove('is-open');
                    utilityPanel.setAttribute('aria-hidden', 'true');
                    button.classList.remove('is-active');
                    utilityPanel.dataset.panel = '';
                    return;
                }

                renderUtilityPanel(panelType);
                utilityPanel.dataset.panel = panelType;
                utilityPanel.classList.add('is-open');
                utilityPanel.setAttribute('aria-hidden', 'false');
                button.classList.add('is-active');
            });
        });
    }

    if (utilityClose && utilityPanel) {
        utilityClose.addEventListener('click', () => {
            utilityPanel.classList.remove('is-open');
            utilityPanel.setAttribute('aria-hidden', 'true');
            utilityButtons.forEach((button) => button.classList.remove('is-active'));
        });
    }

    document.addEventListener('click', (event) => {
        if (utilityPanel && !event.target.closest('.icon-button') && !event.target.closest('.utility-panel')) {
            utilityPanel.classList.remove('is-open');
            utilityPanel.setAttribute('aria-hidden', 'true');
            utilityButtons.forEach((button) => button.classList.remove('is-active'));
        }
    });

    document.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', (event) => {
            event.stopPropagation();
            const isOpen = dropdown.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));

            document.querySelectorAll('.nav-dropdown').forEach((item) => {
                if (item !== dropdown) {
                    item.classList.remove('is-open');
                    const otherToggle = item.querySelector('.nav-dropdown-toggle');
                    if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.nav-dropdown')) {
            document.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
                dropdown.classList.remove('is-open');
                const toggle = dropdown.querySelector('.nav-dropdown-toggle');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
            });
        }
    });

    const toastContainer = document.getElementById('toast-container') || (() => {
        const node = document.createElement('div');
        node.id = 'toast-container';
        node.className = 'toast-container';
        document.body.appendChild(node);
        return node;
    })();

    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);

        window.setTimeout(() => {
            toast.remove();
        }, 3000);
    };

    window.showToast = showToast;

    const setConnectionBanner = () => {
        if (!banner) return;

        if (navigator.onLine) {
            banner.classList.remove('is-visible');
        } else {
            banner.classList.add('is-visible');
        }
    };

    window.addEventListener('online', setConnectionBanner);
    window.addEventListener('offline', setConnectionBanner);
    setConnectionBanner();

    document.querySelectorAll('form').forEach((form) => {
        form.addEventListener('submit', () => {
            const message = form.dataset.toastMessage || 'Guardado correctamente';
            const type = form.dataset.toastType || 'success';
            window.setTimeout(() => showToast(message, type), 120);
        });
    });

    const reservationFilterButtons = document.querySelectorAll('.filter-pill[data-filter]');
    const reservationRows = document.querySelectorAll('table.data-table tbody tr[data-detail-target]');

    if (reservationFilterButtons.length && reservationRows.length) {
        const applyReservationFilter = (selectedFilter) => {
            const normalizedFilter = String(selectedFilter || 'all').toLowerCase();

            reservationFilterButtons.forEach((button) => {
                const isActive = button.dataset.filter === normalizedFilter;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-pressed', String(isActive));
            });

            reservationRows.forEach((row) => {
                const status = (row.dataset.status || '').toLowerCase().trim();
                const matches = normalizedFilter === 'all' || normalizedFilter === status;
                row.style.display = matches ? '' : 'none';
            });
        };

        reservationFilterButtons.forEach((button) => {
            button.addEventListener('click', () => applyReservationFilter(button.dataset.filter));
        });
    }

    const panel = document.querySelector('.detail-panel');
    const detailTitle = document.getElementById('detailTitle');
    const detailCode = document.getElementById('detailCode');
    const detailCapacity = document.getElementById('detailCapacity');
    const detailStatus = document.getElementById('detailStatus');
    const detailEquipment = document.getElementById('detailEquipment');

    const closePanel = () => {
        if (!panel) return;
        panel.classList.remove('open');
    };

    document.querySelectorAll('[data-detail-target]').forEach((row) => {
        row.addEventListener('click', () => {
            if (!panel) return;

            const title = row.dataset.title || 'Registro';
            const code = row.dataset.code || '-';
            const capacity = row.dataset.capacity || '-';
            const status = row.dataset.status || '-';
            const equipment = row.dataset.equipment || 'Sin información';

            if (detailTitle) detailTitle.textContent = title;
            if (detailCode) detailCode.textContent = code;
            if (detailCapacity) detailCapacity.textContent = capacity;
            if (detailStatus) detailStatus.textContent = status;
            if (detailEquipment) detailEquipment.textContent = equipment;

            panel.classList.add('open');
        });
    });

    const closeButton = document.querySelector('[data-close-panel]');
    if (closeButton) {
        closeButton.addEventListener('click', closePanel);
    }

    document.addEventListener('click', (event) => {
        if (!panel || !panel.classList.contains('open')) return;

        const clickedInside = panel.contains(event.target);
        const clickedTrigger = event.target.closest('[data-detail-target]');

        if (!clickedInside && !clickedTrigger) {
            closePanel();
        }
    });

    document.querySelectorAll('.is-invalid').forEach((input) => {
        input.addEventListener('input', () => {
            input.classList.remove('is-invalid');
        });
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboardInteractions);
} else {
    initDashboardInteractions();
}

/* Tablas responsivas: copia el encabezado de cada columna a data-label (vista en tarjetas en celular) */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('table.data-table').forEach((table) => {
        const heads = Array.from(table.querySelectorAll('thead th')).map((th) => th.textContent.trim());
        table.querySelectorAll('tbody tr').forEach((row) => {
            Array.from(row.children).forEach((cell, i) => {
                if (!cell.hasAttribute('colspan') && heads[i]) cell.setAttribute('data-label', heads[i]);
            });
        });
    });
});
