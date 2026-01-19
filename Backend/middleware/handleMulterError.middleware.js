const handleMulterError = (err, req, res, next) => {
    if (err) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                message: 'File too large! Maximum size is 2MB. Please compress your resume.'
            });
        }
        
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Please upload only one file.'
            });
        }
        
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: `Unexpected field "${err.field}". Use "roastResume" as the field name.`
            });
        }
        
        // Custom file filter errors
        if (err.message.includes('Invalid file type')) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        
        // Generic multer error
        return res.status(400).json({
            success: false,
            message: err.message || 'File upload error'
        });
    }
    
    next();
};

module.exports = handleMulterError;