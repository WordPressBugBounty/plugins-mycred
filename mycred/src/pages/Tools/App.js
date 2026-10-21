import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, LinearProgress } from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import { getToolsTheme } from './theme';
import { useAdminTheme } from '../../shared/adminTheme/AdminThemeProvider';
import ToolsShell from './components/ToolsShell';
import ToolsSidebar from './components/ToolsSidebar';
import ToolsContentHeader from './components/ToolsContentHeader';
import ToolsTabs from './components/ToolsTabs';
import BulkAssignForm from './components/BulkAssignForm';
import ImportForm from './components/ImportForm';
import ExportForm from './components/ExportForm';
import ExportSetupForm from './components/ExportSetupForm';
import { buildSetupTypes } from './utils/buildSetupTypes';
import { postToolsCsvDownload } from './utils/downloadToolsCsv';

const defaultSetupState = {
    pointsScope: 'specific',
    pointTypes: [],
    includeHooks: true,
    includeRanks: true,
    achievementsScope: 'all',
    achievementCategories: [],
    includeBadges: true,
    includeLevels: true,
    includeUncategorized: false,
};

const App = () => {
    const { colors } = useAdminTheme();
    const [activeSidebar, setActiveSidebar] = useState('bulk');
    const [activeTab, setActiveTab] = useState('points');
    const [awardToAll, setAwardToAll] = useState(false);
    const [addLogEntry, setAddLogEntry] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [pointType, setPointType] = useState('mycred_default');
    const [points, setPoints] = useState('');
    const [logEntryText, setLogEntryText] = useState('');
    const [selectedBadges, setSelectedBadges] = useState([]);
    const [selectedRank, setSelectedRank] = useState('');
    const [importFile, setImportFile] = useState(null);
    const [importFormatType, setImportFormatType] = useState('id');
    const [exportSettings, setExportSettings] = useState({
        pointTypes: [],
        userField: 'id',
        postField: 'id',
    });
    const [setupState, setSetupState] = useState(defaultSetupState);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userSearchResults, setUserSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const fileInputRef = useRef(null);

    const data = window.mycredToolsData || {
        roles: [],
        pointTypes: [],
        badges: [],
        ranks: [],
        badgeCategories: [],
        uncategorizedBadges: [],
        hasUncategorizedBadges: false,
        isRanksEnabled: false,
        isBadgesEnabled: false,
        ajax_url: '',
        nonce: '',
    };

    useEffect(() => {
        if (userSearchTerm.length < 3) {
            setUserSearchResults([]);
            return undefined;
        }

        const timer = setTimeout(() => {
            setIsSearching(true);
            fetch(
                `${data.ajax_url}?action=mycred-tools-select-user&token=${data.nonce}&search=${encodeURIComponent(userSearchTerm)}`
            )
                .then((res) => res.json())
                .then((results) => {
                    if (results?.results) {
                        setUserSearchResults(
                            results.results.map((user) => ({ email: user.id, name: user.text }))
                        );
                    } else {
                        setUserSearchResults([]);
                    }
                    setIsSearching(false);
                })
                .catch(() => {
                    setUserSearchResults([]);
                    setIsSearching(false);
                });
        }, 500);

        return () => clearTimeout(timer);
    }, [userSearchTerm, data.ajax_url, data.nonce]);

    const handleSidebarChange = (sidebar) => {
        setActiveSidebar(sidebar);
        if (sidebar === 'bulk' && activeTab === 'setup') {
            setActiveTab('points');
        }
    };

    const handleAward = async () => {
        if (isProcessing) return;

        if (!awardToAll && selectedUsers.length === 0 && selectedRoles.length === 0) {
            toast.error('Please select at least one user or role.');
            return;
        }

        if (activeTab === 'points' && !points) {
            toast.error('Please enter points amount.');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        const toastId = toast.loading('Starting bulk assignment...');

        const processLoop = async (loopCount = 0) => {
            const formData = new FormData();
            formData.append('action', 'mycred-tools-assign-award');
            formData.append('token', data.nonce);
            formData.append('loop', loopCount);
            formData.append(
                'selected_type',
                activeTab === 'points' ? 'mycred-tools' : activeTab
            );
            formData.append('award_to_all_users', awardToAll ? 'true' : 'false');
            formData.append(
                'users',
                JSON.stringify(selectedUsers.map((u) => u.email))
            );
            formData.append('user_roles', JSON.stringify(selectedRoles));

            if (activeTab === 'points') {
                formData.append('points_to_award', points);
                formData.append('point_type', pointType);
                formData.append('log_entry', addLogEntry ? 'true' : 'false');
                formData.append('log_entry_text', logEntryText);
            } else if (activeTab === 'badges') {
                formData.append('badges_to_award', JSON.stringify(selectedBadges));
            } else if (activeTab === 'ranks') {
                formData.append('rank_to_award', selectedRank);
            }

            try {
                const response = await fetch(data.ajax_url, { method: 'POST', body: formData });
                const result = await response.json();

                if (result.success === 'selectPointType') {
                    toast.error('Please select a point type.', { id: toastId });
                    setIsProcessing(false);
                    return;
                }

                if (result.success === 'pointsRequired') {
                    toast.error('Points amount is required.', { id: toastId });
                    setIsProcessing(false);
                    return;
                }

                if (result.run_again) {
                    const totalRequests = result.total_ajax_request || 10;
                    setProgress(Math.min(95, ((loopCount + 1) / totalRequests) * 100));
                    await processLoop(loopCount + 1);
                } else {
                    setProgress(100);
                    toast.success('Successfully processed all users!', { id: toastId });
                    setIsProcessing(false);
                }
            } catch {
                toast.error('Something went wrong. Please try again.', { id: toastId });
                setIsProcessing(false);
            }
        };

        await processLoop(0);
    };

    const handleImport = async () => {
        if (!importFile) {
            toast.error('Please select a file to import.');
            return;
        }

        setIsProcessing(true);
        const toastId = toast.loading('Uploading and processing file...');

        const formData = new FormData();
        formData.append('action', 'mycred-tools-import-export');
        formData.append('token', data.nonce);
        formData.append('request_tab', `import-${activeTab}`);
        formData.append('request', 'import');
        formData.append('_file', importFile);
        formData.append('import_format_type', importFormatType);

        try {
            const response = await fetch(data.ajax_url, { method: 'POST', body: formData });
            const result = await response.json();
            toast.success(result, { id: toastId });
            setImportFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch {
            toast.error('Import failed. Please check the file format.', { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownloadTemplate = async (templateType) => {
        const requestTab = `import-${activeTab}`;
        const toastId = toast.loading('Preparing template...');

        try {
            await postToolsCsvDownload(
                data.ajax_url,
                {
                    action: 'mycred-tools-import-export',
                    token: data.nonce,
                    request_tab: requestTab,
                    template: templateType,
                },
                templateType === 'formatted'
                    ? 'formatted-points-template'
                    : `raw-${requestTab}-template`
            );
            toast.success('Template download started!', { id: toastId });
        } catch {
            toast.error('Template download failed.', { id: toastId });
        }
    };

    const submitExportForm = async (params, setupTypes = null) => {
        const requestTab = params.request_tab || `export-${activeTab}`;
        const template = params.template || 'raw';
        const fileName = `${template}-${requestTab}`;
        const toastId = toast.loading('Preparing export...');

        try {
            await postToolsCsvDownload(data.ajax_url, params, fileName, setupTypes);
            toast.success('Export started!', { id: toastId });
        } catch {
            toast.error('Export failed.', { id: toastId });
        }
    };

    const handleExport = (exportType) => {
        if (activeTab === 'setup') {
            const setupTypes = buildSetupTypes(setupState, data);
            if (!setupTypes.length) {
                toast.error('Nothing selected to export.');
                return;
            }

            submitExportForm(
                {
                    action: 'mycred-tools-import-export',
                    token: data.nonce,
                    request_tab: 'export-setup',
                    request: 'export',
                    template: 'raw',
                },
                setupTypes
            );
            return;
        }

        if (activeTab === 'points' && !exportSettings.pointTypes.length) {
            toast.error('Select at least one point type.');
            return;
        }

        if (activeTab === 'badges' && !selectedBadges.length) {
            toast.error('Select at least one badge.');
            return;
        }

        if (activeTab === 'ranks' && !selectedRank) {
            toast.error('Select at least one rank.');
            return;
        }

        submitExportForm({
            action: 'mycred-tools-import-export',
            token: data.nonce,
            request_tab: `export-${activeTab}`,
            request: 'export',
            template: exportType,
            user_field: exportSettings.userField,
            post_field:
                activeTab === 'badges' || activeTab === 'ranks'
                    ? exportSettings.postField
                    : '',
            types: JSON.stringify(
                activeTab === 'points'
                    ? exportSettings.pointTypes
                    : activeTab === 'badges'
                    ? selectedBadges
                    : [selectedRank]
            ),
        });
    };

    return (
        <ThemeProvider theme={getToolsTheme()}>
            <Toaster position="bottom-right" />
            <ToolsShell
                sidebar={
                    <ToolsSidebar active={activeSidebar} onChange={handleSidebarChange} />
                }
            >
                <Box sx={{ flex: 1, minWidth: 0, bgcolor: colors.contentBg, display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
                    <ToolsContentHeader />
                    <ToolsTabs
                        activeTab={activeTab}
                        onChange={setActiveTab}
                        activeSidebar={activeSidebar}
                        data={data}
                    />

                    {activeSidebar === 'bulk' && (
                        <BulkAssignForm
                            activeTab={activeTab}
                            awardToAll={awardToAll}
                            setAwardToAll={setAwardToAll}
                            addLogEntry={addLogEntry}
                            setAddLogEntry={setAddLogEntry}
                            selectedUsers={selectedUsers}
                            setSelectedUsers={setSelectedUsers}
                            selectedRoles={selectedRoles}
                            setSelectedRoles={setSelectedRoles}
                            pointType={pointType}
                            setPointType={setPointType}
                            points={points}
                            setPoints={setPoints}
                            logEntryText={logEntryText}
                            setLogEntryText={setLogEntryText}
                            selectedBadges={selectedBadges}
                            setSelectedBadges={setSelectedBadges}
                            selectedRank={selectedRank}
                            setSelectedRank={setSelectedRank}
                            userSearchTerm={userSearchTerm}
                            setUserSearchTerm={setUserSearchTerm}
                            userSearchResults={userSearchResults}
                            isSearching={isSearching}
                            isProcessing={isProcessing}
                            onAward={handleAward}
                            data={data}
                        />
                    )}

                    {activeSidebar === 'import' && (
                        <ImportForm
                            activeTab={activeTab}
                            importFile={importFile}
                            setImportFile={setImportFile}
                            importFormatType={importFormatType}
                            setImportFormatType={setImportFormatType}
                            fileInputRef={fileInputRef}
                            isProcessing={isProcessing}
                            onImport={handleImport}
                            onDownloadTemplate={handleDownloadTemplate}
                        />
                    )}

                    {activeSidebar === 'export' &&
                        (activeTab === 'setup' ? (
                            <ExportSetupForm
                                setupState={setupState}
                                setSetupState={setSetupState}
                                onExport={() => handleExport('raw')}
                                data={data}
                            />
                        ) : (
                            <ExportForm
                                activeTab={activeTab}
                                exportSettings={exportSettings}
                                setExportSettings={setExportSettings}
                                selectedBadges={selectedBadges}
                                setSelectedBadges={setSelectedBadges}
                                selectedRank={selectedRank}
                                setSelectedRank={setSelectedRank}
                                onExport={handleExport}
                                data={data}
                            />
                        ))}

                    {isProcessing && activeSidebar === 'bulk' && (
                        <Box sx={{ mx: '23px', mb: 3 }}>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{ borderRadius: 1, height: 8 }}
                            />
                        </Box>
                    )}
                </Box>
            </ToolsShell>
        </ThemeProvider>
    );
};

export default App;
