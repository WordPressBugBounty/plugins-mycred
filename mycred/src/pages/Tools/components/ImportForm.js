import React from 'react';
import { Box, Typography, Button, MenuItem, Select, FormControl } from '@mui/material';
import { useToolsColors } from '../theme';
import { useAdminTheme } from '../../../shared/adminTheme/AdminThemeProvider';
import { getSelectSx } from '../formStyles';
import { UploadDownIcon } from '../icons/ToolsIcons';

const ImportForm = ({
    activeTab,
    importFile,
    setImportFile,
    importFormatType,
    setImportFormatType,
    fileInputRef,
    isProcessing,
    onImport,
    onDownloadTemplate,
}) => {
    const COLORS = useToolsColors();
    const { colors } = useAdminTheme();
    const selectSx = getSelectSx(colors);
    const title =
        activeTab === 'points'
            ? 'User Points Import'
            : activeTab === 'badges'
            ? 'User Badges Import'
            : activeTab === 'ranks'
            ? 'User Ranks Import'
            : 'Setup Import';

    return (
        <Box
            sx={{
                mx: '23px',
                mb: '24px',
                bgcolor: COLORS.surface,
                borderRadius: '8px',
                p: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
            }}
        >
            <Typography sx={{ fontSize: '18px', fontWeight: 600, color: COLORS.primaryDark }}>
                {title}
            </Typography>

            <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                    border: `2px dashed ${COLORS.button}`,
                    borderRadius: '8px',
                    p: '40px',
                    textAlign: 'center',
                    bgcolor: COLORS.white,
                    cursor: 'pointer',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <UploadDownIcon color={COLORS.button} />
                </Box>
                <Typography sx={{ fontWeight: 600, color: COLORS.primaryDark }}>
                    Click to upload {activeTab === 'setup' ? 'JSON' : 'CSV'} file
                </Typography>
                <Typography sx={{ fontSize: '12px', color: COLORS.textSoft, mt: 1 }}>
                    {importFile ? `Selected: ${importFile.name}` : 'Max file size: 10MB'}
                </Typography>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept={activeTab === 'setup' ? '.json' : '.csv'}
                    onChange={(e) => setImportFile(e.target.files[0])}
                />
            </Box>

            {(activeTab === 'badges' || activeTab === 'ranks') && (
                <Box>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 1 }}>
                        Import Format Type
                    </Typography>
                    <FormControl fullWidth size="small">
                        <Select
                            value={importFormatType}
                            sx={selectSx}
                            onChange={(e) => setImportFormatType(e.target.value)}
                        >
                            <MenuItem value="id">ID</MenuItem>
                            <MenuItem value="slug">Slug</MenuItem>
                            <MenuItem value="title">Title</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                    variant="contained"
                    onClick={onImport}
                    disabled={isProcessing}
                    startIcon={<UploadDownIcon color="#fff" />}
                    sx={{ bgcolor: COLORS.button, '&:hover': { bgcolor: COLORS.primaryActive } }}
                >
                    Import {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </Button>
                {activeTab !== 'setup' && (
                    <>
                        <Button
                            variant="outlined"
                            onClick={() => onDownloadTemplate('raw')}
                            sx={{ borderColor: COLORS.button, color: COLORS.button }}
                        >
                            Download Raw Template
                        </Button>
                        {activeTab === 'points' && (
                            <Button
                                variant="outlined"
                                onClick={() => onDownloadTemplate('formatted')}
                                sx={{ borderColor: COLORS.button, color: COLORS.button }}
                            >
                                Download Formatted Template
                            </Button>
                        )}
                    </>
                )}
            </Box>

            <Typography sx={{ fontSize: '12px', color: COLORS.textSoft, fontStyle: 'italic' }}>
                {activeTab === 'setup'
                    ? 'Only JSON format is accepted for setup import.'
                    : 'Only raw format can be imported.'}
            </Typography>
        </Box>
    );
};

export default ImportForm;
