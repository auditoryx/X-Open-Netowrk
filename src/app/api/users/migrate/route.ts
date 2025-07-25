import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/unified-models/auth';
import { migrateUserData } from '@/lib/unified-models/migrations/user-unification';

/**
 * User Migration API
 * 
 * Provides endpoints to migrate user data to the unified model
 * Admin-only functionality for executing the user unification
 */

// POST /api/users/migrate - Execute user data migration
export async function POST(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin(request);
    
    const body = await request.json();
    const { dryRun = true, confirm = false } = body;
    
    // Safety check for live migration
    if (!dryRun && !confirm) {
      return NextResponse.json(
        { 
          error: 'Live migration requires explicit confirmation',
          message: 'Set both dryRun=false and confirm=true to execute live migration'
        },
        { status: 400 }
      );
    }
    
    console.log(`Starting user migration (${dryRun ? 'DRY RUN' : 'LIVE'})`);
    
    // Execute migration
    const result = await migrateUserData(dryRun);
    
    return NextResponse.json({
      migration: {
        mode: dryRun ? 'dry-run' : 'live',
        ...result,
      },
      recommendations: {
        nextSteps: dryRun ? [
          'Review the migration results',
          'Fix any validation errors',
          'Run live migration with dryRun=false and confirm=true'
        ] : [
          'Verify migrated user data',
          'Update application configuration to use unified model',
          'Remove legacy user models'
        ]
      }
    });
    
  } catch (error) {
    console.error('Migration API error:', error);
    
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/users/migrate - Check migration status and preview
export async function GET(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin(request);
    
    // Run a quick dry-run to check current state
    const previewResult = await migrateUserData(true);
    
    return NextResponse.json({
      status: 'ready',
      preview: previewResult,
      warnings: [
        'This migration will modify user data structure',
        'Ensure you have database backups before running live migration',
        'Test the migration in a non-production environment first'
      ],
      instructions: {
        dryRun: 'POST /api/users/migrate with { "dryRun": true }',
        liveRun: 'POST /api/users/migrate with { "dryRun": false, "confirm": true }'
      }
    });
    
  } catch (error) {
    console.error('Migration status check error:', error);
    
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to check migration status' },
      { status: 500 }
    );
  }
}