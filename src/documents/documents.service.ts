import { Injectable } from '@nestjs/common';
import { GetDocumentsDto } from './dto/get-document.dto';
import { UserRepository } from 'src/users/repository/user.repository';
import { UploadDocumentDto } from './dto/upload.documents.dto';
import { AwsS3Service } from 'src/aws/aws.service';
import { ResponseHelper } from 'src/common/helpers/reponse-helpers';
import { DocumentRepository } from './repository/document.repository';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly DocumentRepository: DocumentRepository,
  ) {}

  public async getDocuments(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found.');
    return user.documents;
  }

  public async uploadDocuments(uploadDocumentsDto: UploadDocumentDto) {
    const user = await this.userRepository.findById(uploadDocumentsDto.userId);
    if (!user) throw new Error('User not found.');

    const document = this.DocumentRepository.create({
      userId: user.id,
      type: uploadDocumentsDto.type,
      url: uploadDocumentsDto.url,
    });

    ResponseHelper.success('Documents uploaded successfully.', document);
  }
}
