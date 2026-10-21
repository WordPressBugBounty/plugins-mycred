import { useMemo, useState } from '@wordpress/element';
import { Box, Typography, Button, InputBase } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import BoltIcon from '@mui/icons-material/Bolt';
import DescriptionIcon from '@mui/icons-material/Description';
import EventIcon from '@mui/icons-material/Event';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExtensionIcon from '@mui/icons-material/Extension';
import SchoolIcon from '@mui/icons-material/School';
import toast from 'react-hot-toast';
import { CATALOG_GROUPS, groupHooks } from './hookGroups';
import { buildCatalogHooks } from './proHooksCatalog';
import { FONTS, TYPOGRAPHY } from '../../shared/adminTheme/tokens';

const GROUP_ICONS = {
	builtin: BoltIcon,
	forms: DescriptionIcon,
	booking: EventIcon,
	gamification: SportsEsportsIcon,
	enhancements: AutoAwesomeIcon,
	integrations: ExtensionIcon,
	lms: SchoolIcon,
};

const HookCatalog = ( { hooks, colors, onBack, onSelect, initialGroup = 'all' } ) => {
	const [ groupFilter, setGroupFilter ] = useState( initialGroup || 'all' );
	const [ searchTerm, setSearchTerm ] = useState( '' );

	const catalogHooks = useMemo( () => buildCatalogHooks( hooks || [] ), [ hooks ] );
	const { grouped, counts } = useMemo( () => groupHooks( catalogHooks ), [ catalogHooks ] );

	const filteredGrouped = useMemo( () => {
		const query = searchTerm.trim().toLowerCase();
		if ( ! query ) {
			return grouped;
		}
		const next = {};
		Object.keys( grouped ).forEach( ( id ) => {
			next[ id ] = ( grouped[ id ] || [] ).filter( ( hook ) => {
				const hay = `${ hook.title || '' } ${ hook.description || '' }`.toLowerCase();
				return hay.includes( query );
			} );
		} );
		return next;
	}, [ grouped, searchTerm ] );

	const visibleGroups = useMemo( () => {
		const groups = groupFilter === 'all'
			? CATALOG_GROUPS.filter( ( g ) => g.id !== 'all' && counts[ g.id ] > 0 )
			: CATALOG_GROUPS.filter( ( g ) => g.id === groupFilter && counts[ g.id ] > 0 );
		return groups.filter( ( g ) => ( filteredGrouped[ g.id ] || [] ).length > 0 );
	}, [ groupFilter, counts, filteredGrouped ] );

	const hasSearch = searchTerm.trim().length > 0;

	const handleSelect = ( hook ) => {
		if ( hook.is_dummy ) {
			toast(
				'Activate the related Pro addon to use this hook. It will appear automatically once available.',
				{
					icon: '🔒',
					style: {
						background: colors.paper,
						color: colors.textPrimary,
						border: `1px solid ${ colors.border }`,
						fontFamily: FONTS.sans,
						fontSize: '13px',
						borderRadius: '10px',
					},
				}
			);
			return;
		}
		onSelect( hook );
	};

	return (
		<Box>
			<Box
				sx={ {
					display: 'flex',
					alignItems: 'flex-start',
					gap: 1.5,
					mb: 3,
				} }
			>
				<Button
					onClick={ onBack }
					aria-label="Back"
					sx={ {
						minWidth: 40,
						width: 40,
						height: 40,
						p: 0,
						borderRadius: '8px',
						border: `1px solid ${ colors.border }`,
						color: colors.textPrimary,
						bgcolor: colors.paper,
						mt: '2px',
						'&:hover': {
							borderColor: colors.primary,
							color: colors.primary,
							bgcolor: colors.hover,
						},
					} }
				>
					<ArrowBackIcon sx={ { fontSize: 18 } } />
				</Button>
				<Box>
					<Typography
						sx={ {
							...TYPOGRAPHY.pageTitle,
							m: 0,
						} }
					>
						Add Hook
					</Typography>
					<Typography
						sx={ {
							mt: 0.5,
							fontSize: 14,
							color: colors.textMuted,
							fontFamily: FONTS.sans,
						} }
					>
						Pick a hook type to configure. Pro hooks appear when their addon is active.
					</Typography>
				</Box>
			</Box>

			<Box
				component="a"
				href="https://codex.mycred.me/"
				target="_blank"
				rel="noopener noreferrer"
				sx={ {
					display: 'inline-flex',
					alignItems: 'center',
					gap: 0.75,
					mb: 2,
					fontSize: 13,
					fontWeight: 600,
					color: colors.primary,
					textDecoration: 'none',
					fontFamily: FONTS.sans,
					'&:hover': { textDecoration: 'underline' },
				} }
			>
				View documentation
			</Box>

			<Box
				sx={ {
					display: 'flex',
					flexWrap: 'wrap',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 2,
					mb: 2.5,
				} }
			>
				<Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1, flex: 1, minWidth: 0 } }>
					{ CATALOG_GROUPS.map( ( group ) => {
						const count = counts[ group.id ] ?? 0;
						if ( group.id !== 'all' && count === 0 ) {
							return null;
						}
						const active = groupFilter === group.id;
						return (
							<Box
								key={ group.id }
								component="button"
								type="button"
								onClick={ () => setGroupFilter( group.id ) }
								sx={ {
									appearance: 'none',
									border: 'none',
									cursor: 'pointer',
									fontFamily: FONTS.sans,
									fontSize: 13,
									fontWeight: 600,
									lineHeight: '18px',
									px: '14px',
									py: 1,
									borderRadius: '8px',
									bgcolor: active ? colors.filterActiveBg : 'transparent',
									color: active ? colors.primary : colors.textSecondary,
									'&:hover': {
										bgcolor: colors.paperMuted,
										color: colors.textPrimary,
									},
								} }
							>
								{ group.label } ({ count })
							</Box>
						);
					} ) }
				</Box>
				<Box
					sx={ {
						display: 'flex',
						alignItems: 'center',
						bgcolor: colors.paper,
						borderRadius: '8px',
						px: '12px',
						height: '40px',
						width: '100%',
						maxWidth: '392px',
						flex: '1 1 280px',
						border: `1px solid ${ colors.borderInput }`,
						boxSizing: 'border-box',
						transition: 'border-color 0.2s',
						'&:focus-within': {
							borderColor: colors.primary,
						},
					} }
				>
					<SearchIcon sx={ { color: colors.textMuted, mr: 1, fontSize: '24px' } } />
					<InputBase
						placeholder="Search hooks by name or description..."
						value={ searchTerm }
						onChange={ ( e ) => setSearchTerm( e.target.value ) }
						fullWidth
						sx={ {
							fontSize: '14px',
							color: colors.textPrimary,
							fontFamily: FONTS.sans,
							'& .MuiInputBase-input': {
								border: 'none !important',
								boxShadow: 'none !important',
								bgcolor: 'transparent !important',
								outline: 'none !important',
								p: 0,
								m: 0,
								height: 'auto',
								minHeight: 0,
							},
							'& .MuiInputBase-input::placeholder': {
								color: colors.textMuted,
								opacity: 1,
							},
						} }
					/>
				</Box>
			</Box>

			<Box
				sx={ {
					bgcolor: colors.paper,
					border: `1px solid ${ colors.hookCardBorder }`,
					borderRadius: '14px',
					p: 3,
					boxShadow: 'none',
				} }
			>
				{ visibleGroups.length === 0 && (
					<Typography sx={ { color: colors.textSecondary, textAlign: 'center', py: 6 } }>
						{ hasSearch ? 'No hooks match your search.' : 'No hooks in this group.' }
					</Typography>
				) }

				{ visibleGroups.map( ( group ) => {
					const items = filteredGrouped[ group.id ] || [];
					if ( ! items.length ) {
						return null;
					}
					const Icon = GROUP_ICONS[ group.id ] || BoltIcon;

					return (
						<Box key={ group.id } sx={ { mb: 3.5, '&:last-child': { mb: 0 } } }>
							<Typography
								sx={ {
									m: '0 0 12px',
									fontSize: 14,
									fontWeight: 600,
									color: colors.textSecondary,
									fontFamily: FONTS.sans,
								} }
							>
								{ group.label }
							</Typography>
							<Box
								sx={ {
									display: 'grid',
									gridTemplateColumns: {
										xs: '1fr',
										sm: 'repeat(2, 1fr)',
										md: 'repeat(3, 1fr)',
									},
									gap: 2,
								} }
							>
								{ items.map( ( hook ) => {
									const isPro = !! hook.is_pro;
									return (
										<Box
											key={ hook.id }
											component="button"
											type="button"
											onClick={ () => handleSelect( hook ) }
											sx={ {
												appearance: 'none',
												textAlign: 'left',
												cursor: 'pointer',
												fontFamily: 'inherit',
												color: 'inherit',
												bgcolor: colors.paper,
												border: `1px solid ${ colors.hookCardBorder }`,
												borderRadius: '8px',
												p: 2,
												minHeight: 148,
												display: 'flex',
												flexDirection: 'column',
												opacity: hook.is_dummy ? 0.92 : 1,
											} }
										>
											<Box
												sx={ {
													display: 'flex',
													alignItems: 'flex-start',
													justifyContent: 'space-between',
													gap: 1,
												} }
											>
												<Box
													sx={ {
														width: 32,
														height: 32,
														borderRadius: '8px',
														bgcolor: colors.primaryLight,
														color: colors.primary,
														display: 'inline-flex',
														alignItems: 'center',
														justifyContent: 'center',
													} }
												>
													<Icon sx={ { fontSize: 18 } } />
												</Box>
												<Box sx={ { display: 'flex', gap: 0.75, flexWrap: 'wrap' } }>
													<Box
														sx={ {
															fontSize: 10,
															fontWeight: 700,
															lineHeight: 1,
															textTransform: 'uppercase',
															px: '6px',
															py: '4px',
															borderRadius: '4px',
															bgcolor: isPro
																? colors.dangerBg
																: colors.successBg,
															color: isPro
																? colors.danger
																: colors.success,
														} }
													>
														{ isPro ? 'Pro' : 'Free' }
													</Box>
													{ hook.active && (
														<Box
															sx={ {
																fontSize: 10,
																fontWeight: 700,
																lineHeight: 1,
																textTransform: 'uppercase',
																px: '6px',
																py: '4px',
																borderRadius: '4px',
																bgcolor: colors.primaryLight,
																color: colors.primary,
															} }
														>
															Active
														</Box>
													) }
												</Box>
											</Box>
											<Typography
												sx={ {
													mt: 2,
													fontSize: 15,
													fontWeight: 700,
													lineHeight: '22px',
													color: colors.textPrimary,
													fontFamily: FONTS.sans,
												} }
											>
												{ hook.title }
											</Typography>
											<Typography
												sx={ {
													mt: 0.75,
													fontSize: 13,
													fontWeight: 400,
													lineHeight: '18px',
													color: colors.textSecondary,
													fontFamily: FONTS.sans,
													display: '-webkit-box',
													WebkitLineClamp: 2,
													WebkitBoxOrient: 'vertical',
													overflow: 'hidden',
													'& a': {
														color: colors.configure,
														textDecoration: 'none',
													},
												} }
												dangerouslySetInnerHTML={ {
													__html: hook.description || '',
												} }
											/>
										</Box>
									);
								} ) }
							</Box>
						</Box>
					);
				} ) }
			</Box>
		</Box>
	);
};

export default HookCatalog;
