import { Stack, Box, Heading, Text, Button, Card, Input, InlineAlert, DataGate, SimpleGrid, ConfirmDialog, StatusNotify } from '@/common/components';
import { COLORS } from '@/common/constants';
import { AddUserIcon, MailIcon, UserIcon } from '@/adapters/icons';
import { SupervisorRow } from '@/modules/admin/components/SupervisorRow.jsx';
import { useAdminPageController } from '@/modules/admin/controllers/admin-page/useAdminPageController.js';
import { AdminConstants } from '@/modules/admin/constants/AdminConstants.js';

export const AdminPage = () => {
  const { currentUserId, list, addForm, actions } = useAdminPageController();
  const { values, errors, formError, isSubmitting, handleChange, handleSubmit } = addForm;

  return (
    <Stack gap="8" maxW="860px" mx="auto">
      <Box>
        <Heading as="h1" fontSize="32px" fontWeight="800" letterSpacing="-0.02em" color={COLORS.body.heading}>Admin</Heading>
        <Text mt="1" color={COLORS.body.muted}>Manage who can use StyleCheck.</Text>
      </Box>

      <Card p={{ base: '5', md: '8' }}>
        <Heading as="h2" fontSize="19px" fontWeight="700" color={COLORS.body.heading}>Add a supervisor</Heading>
        <Text mt="1" mb="6" fontSize="14px" color={COLORS.body.muted}>
          They receive an email with a link to set their own password. The link is valid for {AdminConstants.INVITE_VALID_HOURS} hours.
        </Text>

        <form onSubmit={handleSubmit} noValidate>
          <Stack gap="5">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="5">
              <Input
                label="Full name"
                placeholder="Dr. Ada Obi"
                startElement={<UserIcon size={18} />}
                value={values.name}
                onChange={(event) => handleChange('name', event.target.value)}
                invalid={Boolean(errors.name)}
                error={errors.name}
              />
              <Input
                label="Email"
                type="email"
                placeholder="ada@university.edu"
                startElement={<MailIcon size={18} />}
                value={values.email}
                onChange={(event) => handleChange('email', event.target.value)}
                invalid={Boolean(errors.email)}
                error={errors.email}
              />
            </SimpleGrid>
            {formError && !Object.keys(errors).length && <InlineAlert status="error" description={formError} />}
            <Box>
              <Button type="submit" tone="primary" size="lg" loading={isSubmitting} loadingText="Adding...">
                <AddUserIcon size={18} /> Add and send invite
              </Button>
            </Box>
          </Stack>
        </form>
      </Card>

      <Card overflow="hidden">
        <Box px="5" py="4">
          <Heading as="h2" fontSize="19px" fontWeight="700" color={COLORS.body.heading}>Supervisors</Heading>
        </Box>
        <DataGate isLoading={list.isLoading} isError={list.isError} error={list.error} onRetry={list.retry} errorTitle="Couldn't load supervisors" skeletonType="list">
          {list.supervisors.length === 0 ? (
            <StatusNotify state="empty" title="No supervisors yet" message="Add the first one above." />
          ) : (
            <Stack as="ul" listStyleType="none" m="0" p="0" gap="0">
              {list.supervisors.map((supervisor) => (
                <SupervisorRow
                  key={supervisor.id}
                  supervisor={supervisor}
                  isSelf={supervisor.id === currentUserId}
                  isInviting={actions.pendingInviteId === supervisor.id}
                  isUpdating={actions.pendingActiveId === supervisor.id}
                  onInvite={actions.sendInvite}
                  onDeactivate={actions.deactivate}
                  onReactivate={actions.reactivate}
                />
              ))}
            </Stack>
          )}
        </DataGate>
      </Card>

      <ConfirmDialog {...actions.confirmDialogProps} />
    </Stack>
  );
};
