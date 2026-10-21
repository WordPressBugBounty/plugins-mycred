import { useState, useEffect, useMemo } from '@wordpress/element';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Typography, Skeleton, Fade, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import toast, { Toaster } from 'react-hot-toast';
import { useAdminTheme } from '../../shared/adminTheme/AdminThemeProvider';
import { ADMIN_CONTENT_PADDING, ADMIN_SETTINGS_FONT } from '../../shared/adminShell/layout';
import { FONTS, TYPOGRAPHY } from '../../shared/adminTheme/tokens';
import { getHooksTheme } from './theme';
import HooksToolbar from './HooksToolbar';
import ViewModeToggle from './ViewModeToggle';
import HookCard from './HookCard';
import HooksPagination from './HooksPagination';
import SettingsView from './SettingsView';
import LevelCredSelector from './LevelCredSelector';
import HookCatalog from './HookCatalog';
import HooksEmptyState from './HooksEmptyState';
import HooksHowToAside from './HooksHowToAside';
import { CATALOG_GROUPS, groupHooks } from './hookGroups';
import { buildCatalogHooks } from './proHooksCatalog';

const HOOKS_VIEW_MODE_KEY = 'mycred_hooks_view_mode';

const getInitialViewMode = () => {
	try {
		const stored = localStorage.getItem( HOOKS_VIEW_MODE_KEY );
		if ( stored === 'grid' || stored === 'list' ) {
			return stored;
		}
	} catch ( e ) {
		// ignore
	}
	return 'grid';
};

const getInitialLevelCredId = () => {
	const urlId = new URLSearchParams( window.location.search ).get( 'id' );
	if ( urlId !== null ) {
		return urlId;
	}
	return window.myCredHooksData?.level_cred_selected || '';
};

const syncLevelCredUrl = ( levelCredId ) => {
	const url = new URL( window.location.href );
	if ( levelCredId ) {
		url.searchParams.set( 'id', levelCredId );
	} else {
		url.searchParams.delete( 'id' );
	}
	window.history.replaceState( {}, '', url.toString() );
};

/** Matches HTML mockup `.admin-shell` — all screens live inside this card. */
const adminShellSx = ( colors ) => ( {
	bgcolor: colors.paper,
	border: `1px solid ${ colors.hookCardBorder }`,
	borderRadius: '14px',
	p: { xs: 2, md: 3 },
	boxShadow: colors.shellShadow,
	minHeight: 640,
	boxSizing: 'border-box',
	width: '100%',
} );

const HooksSkeleton = ( { viewMode, colors } ) => (
	<Box
		sx={ {
			display: viewMode === 'grid' ? 'grid' : 'flex',
			flexDirection: 'column',
			gridTemplateColumns:
				viewMode === 'grid' ? { xs: '1fr', sm: 'repeat(2, 1fr)' } : undefined,
			gap: viewMode === 'grid' ? '16px' : '12px',
		} }
	>
		{ [ 1, 2, 3, 4 ].map( ( i ) => (
			<Skeleton
				key={ i }
				variant="rectangular"
				height={ viewMode === 'grid' ? 180 : 86 }
				sx={ {
					borderRadius: '12px',
					width: '100%',
					border: `1px solid ${ colors.hookCardBorder }`,
				} }
			/>
		) ) }
	</Box>
);

const App = () => {
	const { colors } = useAdminTheme();
	const theme = useMemo( () => getHooksTheme(), [] );
	const bootstrap = window.myCredHooksData || {};

	const [ hooks, setHooks ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ viewMode, setViewMode ] = useState( getInitialViewMode );
	const [ page, setPage ] = useState( 1 );
	const [ rowsPerPage, setRowsPerPage ] = useState( 10 );
	const [ activePointType ] = useState( bootstrap.active_type || 'mycred_default' );
	const [ view, setView ] = useState( 'list' );
	const [ catalogGroup, setCatalogGroup ] = useState( 'all' );
	const [ selectedHook, setSelectedHook ] = useState( null );
	const [ levelCredId, setLevelCredId ] = useState( getInitialLevelCredId );
	const levelCred = bootstrap.level_cred || { enabled: false, options: [] };

	const toastOptions = useMemo(
		() => ( {
			style: {
				background: colors.paper,
				color: colors.textPrimary,
				border: `1px solid ${ colors.border }`,
				fontFamily: FONTS.sans,
				fontSize: '14px',
				borderRadius: '10px',
			},
		} ),
		[ colors ]
	);

	const handleViewModeChange = ( mode ) => {
		setViewMode( mode );
		try {
			localStorage.setItem( HOOKS_VIEW_MODE_KEY, mode );
		} catch ( e ) {
			// ignore
		}
	};

	const fetchHooks = async ( ctype = activePointType, selectedLevelId = levelCredId ) => {
		setLoading( true );
		const formData = new FormData();
		formData.append( 'action', 'mycred_get_hooks_json' );
		formData.append( 'token', bootstrap.nonce || '' );
		formData.append( 'ctype', ctype );
		if ( selectedLevelId ) {
			formData.append( 'level_cred_id', selectedLevelId );
		}

		try {
			const response = await fetch(
				bootstrap.ajaxurl || window.ajaxurl || '/wp-admin/admin-ajax.php',
				{ method: 'POST', body: formData }
			);
			const data = await response.json();
			if ( data.success ) {
				const nextHooks = data.data.hooks || [];
				setHooks( nextHooks );
				setSelectedHook( ( prev ) => {
					if ( ! prev ) {
						return prev;
					}
					const fresh = nextHooks.find( ( h ) => h.id === prev.id );
					return fresh || prev;
				} );
			}
		} catch ( error ) {
			console.error( 'Failed to fetch hooks:', error );
			toast.error( 'Could not load hooks.', toastOptions );
		} finally {
			setLoading( false );
		}
	};

	useEffect( () => {
		fetchHooks( activePointType, levelCredId );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ activePointType, levelCredId ] );

	useEffect( () => {
		setPage( 1 );
	}, [ searchTerm, viewMode, rowsPerPage ] );

	const handleLevelCredChange = ( nextId ) => {
		setLevelCredId( nextId );
		syncLevelCredUrl( nextId );
	};

	const handleToggleHook = async ( hookId, currentState ) => {
		setHooks( ( prev ) =>
			prev.map( ( h ) => ( h.id === hookId ? { ...h, active: ! currentState } : h ) )
		);
		setSelectedHook( ( prev ) =>
			prev && prev.id === hookId ? { ...prev, active: ! currentState } : prev
		);

		const formData = new FormData();
		formData.append( 'action', 'mycred_toggle_hook' );
		formData.append( 'token', bootstrap.nonce || '' );
		formData.append( 'ctype', activePointType );
		formData.append( 'hook_id', hookId );
		formData.append( 'activate', ! currentState ? '1' : '0' );
		if ( levelCredId ) {
			formData.append( 'level_cred_id', levelCredId );
		}

		try {
			const response = await fetch( bootstrap.ajaxurl || window.ajaxurl, {
				method: 'POST',
				body: formData,
			} );
			const data = await response.json();
			if ( data.success ) {
				toast.success(
					`Hook ${ ! currentState ? 'enabled' : 'disabled' } successfully!`,
					toastOptions
				);
			} else {
				fetchHooks( activePointType, levelCredId );
			}
		} catch ( error ) {
			fetchHooks( activePointType, levelCredId );
		}
	};

	const openConfigure = ( hook ) => {
		setSelectedHook( hook );
		setView( 'configure' );
	};

	const backToList = () => {
		setSelectedHook( null );
		setCatalogGroup( 'all' );
		setView( 'list' );
	};

	const openCatalog = ( groupId = 'all' ) => {
		setCatalogGroup( groupId || 'all' );
		setView( 'catalog' );
	};

	const emptyCategories = useMemo( () => {
		const catalogHooks = buildCatalogHooks( hooks || [] );
		const { counts } = groupHooks( catalogHooks );
		return CATALOG_GROUPS.filter(
			( g ) => g.id !== 'all' && ( counts[ g.id ] || 0 ) > 0
		).map( ( g ) => ( { id: g.id, label: g.label } ) );
	}, [ hooks ] );

	const filteredHooks = useMemo(
		() =>
			hooks.filter( ( hook ) => {
				if ( ! hook.active ) {
					return false;
				}
				const hay = `${ hook.title || '' } ${ hook.description || '' }`.toLowerCase();
				return hay.includes( searchTerm.toLowerCase() );
			} ),
		[ hooks, searchTerm ]
	);

	const paginatedHooks = useMemo( () => {
		if ( viewMode === 'grid' ) {
			return filteredHooks;
		}
		const start = ( page - 1 ) * rowsPerPage;
		return filteredHooks.slice( start, start + rowsPerPage );
	}, [ filteredHooks, page, rowsPerPage, viewMode ] );

	const stats = useMemo(
		() => ( {
			all: hooks.length,
			active: hooks.filter( ( h ) => h.active ).length,
			inactive: hooks.filter( ( h ) => ! h.active ).length,
		} ),
		[ hooks ]
	);

	const selectedLevelLabel = useMemo( () => {
		if ( ! levelCredId || ! levelCred?.options?.length ) {
			return '';
		}
		const match = levelCred.options.find(
			( opt ) => String( opt.value ) === String( levelCredId )
		);
		return match?.label || '';
	}, [ levelCred, levelCredId ] );

	// No active hooks → full empty state (search field stays hidden).
	// A search with no matches keeps the toolbar and shows the empty state below it.
	const noActiveHooks = ! loading && stats.active === 0;
	const noSearchMatches =
		! loading && stats.active > 0 && filteredHooks.length === 0;

	return (
		<ThemeProvider theme={ theme }>
			<Box
				sx={ {
					pt: 2,
					pb: 10,
					px: ADMIN_CONTENT_PADDING,
					bgcolor: 'transparent',
					minHeight: 'calc(100vh - 60px)',
					boxSizing: 'border-box',
					width: '100%',
					fontFamily: ADMIN_SETTINGS_FONT,
				} }
			>
				{ /* Outer admin-shell card — list / catalog / configure all stay inside */ }
				<Box
					sx={ [
						adminShellSx( colors ),
						view === 'configure' && selectedHook
							? {
									maxWidth: 780,
									mx: 'auto',
									minHeight: 0,
							  }
							: null,
					] }
				>
					{ view === 'configure' && selectedHook ? (
						<SettingsView
							hook={ selectedHook }
							onBack={ backToList }
							pointType={ activePointType }
							levelCredId={ levelCredId }
							levelCredLabel={ selectedLevelLabel }
							onToggle={ handleToggleHook }
							onSaveSuccess={ () => {
								fetchHooks( activePointType, levelCredId );
							} }
						/>
					) : view === 'catalog' ? (
						<HookCatalog
							hooks={ hooks }
							colors={ colors }
							onBack={ backToList }
							onSelect={ openConfigure }
							initialGroup={ catalogGroup }
						/>
					) : (
						<>
							<Box
								sx={ {
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'flex-start',
									gap: 2,
									flexWrap: 'wrap',
									mb: 3,
								} }
							>
								<Box>
									<Typography
										sx={ {
											...TYPOGRAPHY.pageTitle,
											m: 0,
										} }
									>
										Hooks
									</Typography>
									<Typography
										sx={ {
											mt: 0.5,
											color: colors.textMuted,
											fontSize: 14,
											fontFamily: FONTS.sans,
										} }
									>
										{ stats.active } active
									</Typography>
								</Box>

								<Box
									sx={ {
										display: 'flex',
										alignItems: 'center',
										gap: 1.5,
										flexWrap: 'wrap',
									} }
								>
									<ViewModeToggle
										viewMode={ viewMode }
										setViewMode={ handleViewModeChange }
										colors={ colors }
									/>
									<Button
										variant="contained"
										startIcon={ <AddIcon /> }
										onClick={ () => openCatalog( 'all' ) }
										sx={ {
											height: 44,
											px: 2.5,
											borderRadius: '8px',
											textTransform: 'none',
											fontWeight: 600,
											fontSize: 14,
											fontFamily: FONTS.sans,
											bgcolor: colors.primary,
											boxShadow: 'none',
											'&:hover': {
												bgcolor: colors.primaryHover,
												boxShadow: 'none',
											},
										} }
									>
										Add Hook
									</Button>
								</Box>
							</Box>

							{ levelCred.enabled ? (
								<LevelCredSelector
									value={ levelCredId }
									onChange={ handleLevelCredChange }
									levelCred={ levelCred }
									colors={ colors }
								/>
							) : null }

							{ loading ? (
								<HooksSkeleton viewMode={ viewMode } colors={ colors } />
							) : (
								<Fade in={ ! loading }>
									<Box
										sx={ {
											display: 'grid',
											gridTemplateColumns: {
												xs: '1fr',
												lg: 'minmax(0, 1fr) 280px',
											},
											gap: '20px',
											alignItems: 'start',
										} }
									>
										<Box>
											{ noActiveHooks ? (
												<HooksEmptyState
													colors={ colors }
													hasHooks={ false }
													categories={ emptyCategories }
													onCreate={ () => openCatalog( 'all' ) }
													onSelectCategory={ openCatalog }
												/>
											) : (
												<>
													<HooksToolbar
														searchTerm={ searchTerm }
														setSearchTerm={ setSearchTerm }
														colors={ colors }
													/>
													{ noSearchMatches ? (
														<HooksEmptyState
															colors={ colors }
															hasHooks
															categories={ emptyCategories }
															onCreate={ () => openCatalog( 'all' ) }
															onSelectCategory={ openCatalog }
														/>
													) : (
														<>
															<Box
																sx={ {
																	display:
																		viewMode === 'grid'
																			? 'grid'
																			: 'flex',
																	flexDirection: 'column',
																	gridTemplateColumns:
																		viewMode === 'grid'
																			? {
																					xs: '1fr',
																					sm: 'repeat(2, 1fr)',
																			  }
																			: undefined,
																	gap:
																		viewMode === 'grid'
																			? '16px'
																			: '12px',
																} }
															>
																{ paginatedHooks.map(
																	( hook, index ) => (
																		<HookCard
																			key={ hook.id || index }
																			hook={ hook }
																			onToggle={ () =>
																				handleToggleHook(
																					hook.id,
																					hook.active
																				)
																			}
																			onConfigure={ () =>
																				openConfigure( hook )
																			}
																			viewMode={ viewMode }
																			index={ index }
																			colors={ colors }
																		/>
																	)
																) }
															</Box>

															{ viewMode === 'list' &&
																filteredHooks.length > 0 && (
																	<Box sx={ { mt: 3 } }>
																		<HooksPagination
																			totalCount={
																				filteredHooks.length
																			}
																			page={ page }
																			rowsPerPage={ rowsPerPage }
																			onPageChange={ setPage }
																			onRowsPerPageChange={
																				setRowsPerPage
																			}
																			colors={ colors }
																		/>
																	</Box>
																) }
														</>
													) }
												</>
											) }
										</Box>

										<HooksHowToAside colors={ colors } />
									</Box>
								</Fade>
							) }
						</>
					) }
				</Box>

				<Toaster
					position="bottom-right"
					reverseOrder={ false }
					toastOptions={ toastOptions }
				/>
			</Box>
		</ThemeProvider>
	);
};

export default App;
