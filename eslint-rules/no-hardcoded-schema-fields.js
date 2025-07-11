// Custom ESLint rule to prevent hardcoded schema field strings
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent hardcoded schema field strings, use SCHEMA_FIELDS constants instead',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    // Known schema field names that should not be hardcoded
    const SCHEMA_FIELD_NAMES = [
      // User fields
      'id', 'email', 'name', 'role', 'createdAt', 'updatedAt', 'averageRating', 
      'reviewCount', 'tier', 'xp', 'rankScore',
      // Review fields
      'authorId', 'targetId', 'bookingId', 'contractId', 'rating', 'text', 
      'migratedAt', 'migrationVersion',
      // Booking fields
      'clientId', 'providerId', 'serviceId', 'serviceName', 'status', 'datetime', 
      'title', 'notes', 'hasReview', 'paymentStatus',
      // Service fields
      'creatorId', 'description', 'price', 'duration', 'category', 'isActive',
      // Contract fields
      'terms', 'agreedByClient', 'agreedByProvider',
      // Notification fields
      'userId', 'type', 'message', 'read', 'link',
      // XP Transaction fields
      'event', 'xpAmount', 'contextId', 'metadata',
      // User Progress fields
      'totalXP', 'dailyXP', 'lastXPDate', 'streak', 'lastActivityAt',
      // Dispute fields
      'reason', 'description',
    ];

    return {
      Literal(node) {
        // Check if this is a string literal that matches a schema field name
        if (typeof node.value === 'string' && SCHEMA_FIELD_NAMES.includes(node.value)) {
          // Check if this is in a context where it's likely a database field reference
          const parent = node.parent;
          
          // Skip if it's in an import statement
          if (parent && parent.type === 'ImportSpecifier') {
            return;
          }
          
          // Skip if it's in a type annotation or interface
          if (parent && (parent.type === 'TSPropertySignature' || parent.type === 'TSInterfaceDeclaration')) {
            return;
          }
          
          // Skip if it's in the schema definition file itself
          const filename = context.getFilename();
          if (filename.includes('schema.ts') || filename.includes('@schema.d.ts')) {
            return;
          }
          
          // Skip if it's in a comment
          if (parent && parent.type === 'Comment') {
            return;
          }
          
          // Check if this looks like a database field access
          const isLikelyFieldAccess = (
            // Object property access: obj.field or obj['field']
            (parent && (parent.type === 'MemberExpression' || parent.type === 'Property')) ||
            // Function call with field name: where('field', '==', value)
            (parent && parent.type === 'CallExpression') ||
            // Array access: arr['field']
            (parent && parent.type === 'ArrayExpression')
          );
          
          if (isLikelyFieldAccess) {
            context.report({
              node,
              message: `Hardcoded schema field string '${node.value}' detected. Use SCHEMA_FIELDS constants instead to ensure type safety.`,
              fix(fixer) {
                // Try to suggest a replacement based on the field name
                const fieldName = node.value;
                const suggestion = getSuggestion(fieldName);
                if (suggestion) {
                  return fixer.replaceText(node, suggestion);
                }
                return null;
              },
            });
          }
        }
      },
    };
  },
};

function getSuggestion(fieldName) {
  // Map field names to their SCHEMA_FIELDS constants
  const fieldMap = {
    'id': 'SCHEMA_FIELDS.USER.ID',
    'email': 'SCHEMA_FIELDS.USER.EMAIL',
    'name': 'SCHEMA_FIELDS.USER.NAME',
    'role': 'SCHEMA_FIELDS.USER.ROLE',
    'createdAt': 'SCHEMA_FIELDS.USER.CREATED_AT',
    'updatedAt': 'SCHEMA_FIELDS.USER.UPDATED_AT',
    'averageRating': 'SCHEMA_FIELDS.USER.AVERAGE_RATING',
    'reviewCount': 'SCHEMA_FIELDS.USER.REVIEW_COUNT',
    'tier': 'SCHEMA_FIELDS.USER.TIER',
    'xp': 'SCHEMA_FIELDS.USER.XP',
    'rankScore': 'SCHEMA_FIELDS.USER.RANK_SCORE',
    'authorId': 'SCHEMA_FIELDS.REVIEW.AUTHOR_ID',
    'targetId': 'SCHEMA_FIELDS.REVIEW.TARGET_ID',
    'bookingId': 'SCHEMA_FIELDS.REVIEW.BOOKING_ID',
    'contractId': 'SCHEMA_FIELDS.REVIEW.CONTRACT_ID',
    'rating': 'SCHEMA_FIELDS.REVIEW.RATING',
    'text': 'SCHEMA_FIELDS.REVIEW.TEXT',
    'migratedAt': 'SCHEMA_FIELDS.REVIEW.MIGRATED_AT',
    'migrationVersion': 'SCHEMA_FIELDS.REVIEW.MIGRATION_VERSION',
    'clientId': 'SCHEMA_FIELDS.BOOKING.CLIENT_ID',
    'providerId': 'SCHEMA_FIELDS.BOOKING.PROVIDER_ID',
    'serviceId': 'SCHEMA_FIELDS.BOOKING.SERVICE_ID',
    'serviceName': 'SCHEMA_FIELDS.BOOKING.SERVICE_NAME',
    'status': 'SCHEMA_FIELDS.BOOKING.STATUS',
    'datetime': 'SCHEMA_FIELDS.BOOKING.DATETIME',
    'title': 'SCHEMA_FIELDS.BOOKING.TITLE',
    'notes': 'SCHEMA_FIELDS.BOOKING.NOTES',
    'hasReview': 'SCHEMA_FIELDS.BOOKING.HAS_REVIEW',
    'paymentStatus': 'SCHEMA_FIELDS.BOOKING.PAYMENT_STATUS',
    'creatorId': 'SCHEMA_FIELDS.SERVICE.CREATOR_ID',
    'description': 'SCHEMA_FIELDS.SERVICE.DESCRIPTION',
    'price': 'SCHEMA_FIELDS.SERVICE.PRICE',
    'duration': 'SCHEMA_FIELDS.SERVICE.DURATION',
    'category': 'SCHEMA_FIELDS.SERVICE.CATEGORY',
    'isActive': 'SCHEMA_FIELDS.SERVICE.IS_ACTIVE',
    'terms': 'SCHEMA_FIELDS.CONTRACT.TERMS',
    'agreedByClient': 'SCHEMA_FIELDS.CONTRACT.AGREED_BY_CLIENT',
    'agreedByProvider': 'SCHEMA_FIELDS.CONTRACT.AGREED_BY_PROVIDER',
    'userId': 'SCHEMA_FIELDS.NOTIFICATION.USER_ID',
    'type': 'SCHEMA_FIELDS.NOTIFICATION.TYPE',
    'message': 'SCHEMA_FIELDS.NOTIFICATION.MESSAGE',
    'read': 'SCHEMA_FIELDS.NOTIFICATION.READ',
    'link': 'SCHEMA_FIELDS.NOTIFICATION.LINK',
    'event': 'SCHEMA_FIELDS.XP_TRANSACTION.EVENT',
    'xpAmount': 'SCHEMA_FIELDS.XP_TRANSACTION.XP_AMOUNT',
    'contextId': 'SCHEMA_FIELDS.XP_TRANSACTION.CONTEXT_ID',
    'metadata': 'SCHEMA_FIELDS.XP_TRANSACTION.METADATA',
    'totalXP': 'SCHEMA_FIELDS.USER_PROGRESS.TOTAL_XP',
    'dailyXP': 'SCHEMA_FIELDS.USER_PROGRESS.DAILY_XP',
    'lastXPDate': 'SCHEMA_FIELDS.USER_PROGRESS.LAST_XP_DATE',
    'streak': 'SCHEMA_FIELDS.USER_PROGRESS.STREAK',
    'lastActivityAt': 'SCHEMA_FIELDS.USER_PROGRESS.LAST_ACTIVITY_AT',
    'reason': 'SCHEMA_FIELDS.DISPUTE.REASON',
  };
  
  return fieldMap[fieldName] || null;
}