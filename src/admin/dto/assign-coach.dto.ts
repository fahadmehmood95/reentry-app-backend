import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';

export enum CoachAssignmentAction {
  ASSIGN = 'ASSIGN',
  UNASSIGN = 'UNASSIGN',
}

export class AssignCoachDto {
  @ApiProperty({
    example: '9f7e6d32-0a8b-4f59-8d4e-5d5b8b4d9f71',
    description: 'Coach ID',
  })
  @IsUUID()
  coachId!: string;

  @ApiProperty({
    example: '7a5b3c21-8d3f-4d9b-9b1e-1c4d5e6f7a89',
    description: 'Client ID',
  })
  @IsUUID()
  clientId!: string;

  @ApiProperty({
    enum: CoachAssignmentAction,
    example: CoachAssignmentAction.ASSIGN,
  })
  @IsEnum(CoachAssignmentAction)
  action!: CoachAssignmentAction;
}
