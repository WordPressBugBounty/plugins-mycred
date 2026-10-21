import { useEffect, useLayoutEffect, useRef, useState } from '@wordpress/element';
import { Box, Typography, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../shared/adminTheme/AdminThemeProvider';
import { getHookSettingsCss } from './hookSettingsStyles';
import { initBdayProRepeater } from './hookLegacyRepeaters';
import { FONTS } from '../../shared/adminTheme/tokens';

const EnableSwitch = ( { checked, onChange, colors } ) => (
	<Box
		onClick={ onChange }
		role="switch"
		aria-checked={ checked }
		sx={ {
			width: 36,
			height: 20,
			borderRadius: '10px',
			bgcolor: checked ? colors.primaryLight : colors.switchTrackOff,
			position: 'relative',
			cursor: 'pointer',
			transition: 'background-color 0.2s',
			flexShrink: 0,
		} }
	>
		<Box
			sx={ {
				width: 14,
				height: 14,
				borderRadius: '50%',
				bgcolor: checked ? colors.configure : colors.white,
				boxShadow: colors.shadowMenu,
				position: 'absolute',
				top: '3px',
				left: checked ? '19px' : '3px',
				transition: 'all 0.2s',
			} }
		/>
	</Box>
);

/**
 * Configure chrome inside admin-shell:
 * Back → header form-card → settings form-card (General Settings + prefs_html + footer).
 */
export default function SettingsView( {
	hook,
	onBack,
	pointType = null,
	levelCredId = null,
	levelCredLabel = null,
	onSaveSuccess,
	onToggle,
} ) {
	const { colors } = useAdminTheme();
	const formRef = useRef( null );
	const [ saving, setSaving ] = useState( false );
	const bootstrap = window.myCredHooksData || {};
	const ctype = pointType || bootstrap.active_type || 'mycred_default';
	const isActive = !! hook?.active;

	useLayoutEffect( () => {
		if ( ! formRef.current || ! hook?.prefs_html ) {
			return;
		}
		formRef.current.innerHTML = hook.prefs_html;
	}, [ hook?.id, hook?.prefs_html ] );

	useEffect( () => {
		if ( typeof window.jQuery === 'undefined' || ! formRef.current ) {
			return undefined;
		}
		const $ = window.jQuery;
		const $root = $( formRef.current );

		$root.off( 'change.mycredHooksSelect' );
		$root.on( 'change.mycredHooksSelect', 'select', function () {
			const selected = $( this ).find( ':selected' );
			const toggle = selected.data( 'mycred-toggle' );
			if ( toggle !== undefined ) {
				$( toggle ).show().siblings().hide();
			}
		} );
		$root.find( 'select' ).each( function () {
			const selected = $( this ).find( ':selected' );
			const toggle = selected.data( 'mycred-toggle' );
			if ( toggle !== undefined ) {
				$( toggle ).show().siblings().hide();
			}
		} );

		const applyLimitToggle = ( selectEl ) => {
			const $select = $( selectEl );
			const $input = $select.prev( 'input' );
			if ( ! $input.length ) {
				return;
			}
			$input.attr( 'type', $select.val() === 'x' ? 'hidden' : 'text' );
		};

		$root.off( 'change.mycredHooksLimit' );
		$root.on( 'change.mycredHooksLimit', 'select.limit-toggle', function () {
			applyLimitToggle( this );
		} );
		$root.find( 'select.limit-toggle' ).each( function () {
			applyLimitToggle( this );
		} );

		if ( typeof window.wptuts_open_editor === 'function' ) {
			$root
				.off( 'click.mycredHooksEditor', '.mycred-intro-image-button' )
				.on( 'click.mycredHooksEditor', '.mycred-intro-image-button', function ( e ) {
					e.preventDefault();
					window.wptuts_open_editor( e, $( this ) );
				} );
		}

		// prefs_html is injected after page load — re-init Select2 for specific-content hooks.
		const initSelect2 = () => {
			$( document ).trigger( 'specific-content-select2' );
		};

		initBdayProRepeater( $root );

		const raf = window.requestAnimationFrame
			? window.requestAnimationFrame( initSelect2 )
			: setTimeout( initSelect2, 0 );

		return () => {
			$root.off( 'change.mycredHooksSelect' );
			$root.off( 'change.mycredHooksLimit' );
			$root.off( 'click.mycredHooksEditor' );
			$root.off( 'click.mycredHooksBdayPro' );
			if ( typeof raf === 'number' && window.cancelAnimationFrame ) {
				window.cancelAnimationFrame( raf );
			} else {
				clearTimeout( raf );
			}
		};
	}, [ hook?.id, hook?.prefs_html ] );

	const handleSave = async () => {
		if ( ! formRef.current || saving ) {
			return;
		}
		setSaving( true );
		try {
			const formData = new FormData();
			formData.append( 'action', 'mycred_save_hook' );
			formData.append( 'token', bootstrap.nonce || '' );
			formData.append( 'hook_id', hook.id );
			formData.append( 'ctype', ctype );
			if ( levelCredId ) {
				formData.append( 'level_cred_id', String( levelCredId ) );
			}

			formRef.current.querySelectorAll( 'input, select, textarea' ).forEach( ( el ) => {
				if ( ! el.name ) {
					return;
				}
				if ( el.type === 'checkbox' || el.type === 'radio' ) {
					if ( el.checked ) {
						formData.append( el.name, el.value || '1' );
					}
				} else if ( el.tagName === 'SELECT' && el.multiple ) {
					Array.from( el.selectedOptions ).forEach( ( opt ) => {
						formData.append( el.name, opt.value );
					} );
				} else {
					formData.append( el.name, el.value );
				}
			} );

			const res = await fetch( bootstrap.ajaxurl || window.ajaxurl, {
				method: 'POST',
				body: formData,
				credentials: 'same-origin',
			} );
			const data = await res.json();
			if ( ! data.success ) {
				const errMsg =
					typeof data.data === 'string'
						? data.data
						: data.data?.message || 'Save failed';
				throw new Error( errMsg );
			}
			const okMsg =
				typeof data.data === 'string'
					? data.data
					: data.data?.message || 'Settings saved';
			toast.success( okMsg );
			if ( typeof onSaveSuccess === 'function' ) {
				onSaveSuccess();
			}
		} catch ( err ) {
			toast.error( err.message || 'Failed to save' );
		} finally {
			setSaving( false );
		}
	};

	if ( ! hook ) {
		return null;
	}

	const formCardSx = {
		p: 0,
		mb: 2,
		borderRadius: '12px',
		border: `1px solid ${ colors.hookCardBorder }`,
		backgroundColor: colors.paper,
		boxShadow: 'none',
		overflow: 'hidden',
	};

	return (
		<Box sx={ { width: '100%', overflowX: 'hidden' } }>
			<style>{ getHookSettingsCss( colors ) }</style>

			<Button
				startIcon={ <ArrowBackIcon /> }
				onClick={ onBack }
				sx={ {
					textTransform: 'none',
					color: colors.primary,
					fontWeight: 600,
					mb: 2.5,
					px: 0,
					minWidth: 0,
					'&:hover': { backgroundColor: 'transparent', color: colors.primaryHover },
				} }
			>
				Back to Hooks
			</Button>

			{ /* Header form-card */ }
			<Paper elevation={ 0 } sx={ { ...formCardSx, p: 2.5 } }>
				<Box
					sx={ {
						display: 'flex',
						alignItems: 'flex-start',
						justifyContent: 'space-between',
						gap: 2,
						flexWrap: 'wrap',
					} }
				>
					<Box sx={ { minWidth: 0, flex: 1 } }>
						<Box
							sx={ {
								display: 'flex',
								alignItems: 'center',
								gap: 1,
								flexWrap: 'wrap',
								mb: 0.75,
							} }
						>
							<Typography
								sx={ {
									fontWeight: 700,
									fontSize: 20,
									lineHeight: '28px',
									color: colors.textPrimary,
									fontFamily: FONTS.sans,
								} }
							>
								{ hook.title }
							</Typography>
							<Box
								component="span"
								sx={ {
									fontSize: 10,
									fontWeight: 700,
									lineHeight: 1,
									textTransform: 'uppercase',
									px: '6px',
									py: '4px',
									borderRadius: '4px',
									bgcolor: isActive ? colors.successBg : colors.paperMuted,
									color: isActive ? colors.success : colors.textMuted,
								} }
							>
								{ isActive ? 'Active' : 'Inactive' }
							</Box>
						</Box>
						{ levelCredLabel ? (
							<Typography
								variant="caption"
								sx={ {
									display: 'block',
									color: colors.primary,
									fontWeight: 600,
									mb: 0.75,
								} }
							>
								Editing for: { levelCredLabel }
							</Typography>
						) : null }
						{ hook.description ? (
							<Typography
								sx={ {
									color: colors.textSecondary,
									fontSize: 14,
									lineHeight: 1.55,
									fontFamily: FONTS.sans,
									'& a': { color: colors.configure, textDecoration: 'none' },
								} }
								dangerouslySetInnerHTML={ { __html: hook.description } }
							/>
						) : null }
					</Box>

					{ hook.documentation ? (
						<Button
							component="a"
							href={ hook.documentation }
							target="_blank"
							rel="noopener noreferrer"
							endIcon={ <OpenInNewIcon sx={ { fontSize: 16 } } /> }
							sx={ {
								textTransform: 'none',
								fontWeight: 600,
								color: colors.primary,
								px: 0,
								minWidth: 0,
								flexShrink: 0,
								'&:hover': {
									backgroundColor: 'transparent',
									textDecoration: 'underline',
								},
							} }
						>
							View documentation
						</Button>
					) : null }
				</Box>
			</Paper>

			{ /* Settings form-card */ }
			<Paper elevation={ 0 } sx={ { ...formCardSx, mb: 0 } }>
				<Box
					sx={ {
						px: 2.5,
						borderBottom: `1px solid ${ colors.hookCardBorder }`,
						backgroundColor: colors.paper,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 2,
						flexWrap: 'wrap',
					} }
				>
					<Box
						component="span"
						sx={ {
							display: 'inline-block',
							py: 1.5,
							px: 0.5,
							fontSize: 14,
							fontWeight: 600,
							color: colors.textPrimary,
							borderBottom: `2px solid ${ colors.configure }`,
							fontFamily: FONTS.sans,
						} }
					>
						General Settings
					</Box>

					{ typeof onToggle === 'function' ? (
						<Box
							sx={ {
								display: 'inline-flex',
								alignItems: 'center',
								gap: 1,
								py: 1,
							} }
						>
							<Typography
								sx={ {
									fontSize: 13,
									fontWeight: 600,
									color: colors.textSecondary,
									fontFamily: FONTS.sans,
								} }
							>
								{ isActive ? 'Enabled' : 'Disabled' }
							</Typography>
							<EnableSwitch
								checked={ isActive }
								onChange={ () => onToggle( hook.id, isActive ) }
								colors={ colors }
							/>
						</Box>
					) : null }
				</Box>

				<Box sx={ { p: 2.5 } }>
					{ hook.prefs_html ? (
						<div ref={ formRef } className="hook-settings-rendered" />
					) : (
						<Typography sx={ { color: colors.textSecondary, fontSize: 14 } }>
							No settings available for this hook.
						</Typography>
					) }
				</Box>

				{ /* Footer stays inside settings card (mockup) */ }
				<Box
					sx={ {
						px: 2.5,
						py: 2,
						borderTop: `1px solid ${ colors.hookCardBorder }`,
						display: 'flex',
						justifyContent: 'flex-end',
						gap: 1.5,
					} }
				>
					<Button
						variant="outlined"
						onClick={ onBack }
						disabled={ saving }
						sx={ {
							textTransform: 'none',
							fontWeight: 600,
							borderRadius: '8px',
							borderColor: colors.border,
							color: colors.textPrimary,
							px: 2.5,
							height: 40,
						} }
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						onClick={ handleSave }
						disabled={ saving || ! hook.prefs_html }
						sx={ {
							textTransform: 'none',
							fontWeight: 600,
							borderRadius: '8px',
							backgroundColor: colors.primary,
							px: 2.5,
							height: 40,
							boxShadow: 'none',
							'&:hover': {
								backgroundColor: colors.primaryHover,
								boxShadow: 'none',
							},
						} }
					>
						{ saving ? 'Saving…' : 'Update Settings' }
					</Button>
				</Box>
			</Paper>
		</Box>
	);
}
