/**
 * Warmup Function
 * Called by frontend to mitigate cold starts
 */
module.exports = async (data, context) => {
    return { status: 'warm' };
};
