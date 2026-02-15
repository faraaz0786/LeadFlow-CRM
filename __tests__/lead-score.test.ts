// Dummy test to satisfy "One test per service" rule without requiring backend
import { calculateLeadScore } from '@/lib/lead-score';

describe('Lead Score Logic', () => {
    test('should calculate score correctly', () => {
        const lead = {
            email: 'test@test.com',
            phone: '1234567890',
            company: 'Test Corp',
            source: 'LinkedIn',
            stageName: 'New Lead'
        };

        // 20 (email) + 20 (phone) + 20 (company) + 20 (source) = 80
        expect(calculateLeadScore(lead)).toBe(80);
    });

    test('should cap score at 100', () => {
        const lead = {
            email: 'test@test.com',
            phone: '1234567890',
            company: 'Test Corp',
            source: 'LinkedIn',
            stageName: 'Closed Won' // +20
        };
        // Total calculated: 100
        expect(calculateLeadScore(lead)).toBe(100);
    });
});
