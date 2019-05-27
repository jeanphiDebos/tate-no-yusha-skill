<?php

namespace App\EventListener;

use App\Entity\Skill;
use App\Entity\Weapon;
use App\Service\FileUploader;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\EventDispatcher\GenericEvent;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;

class FileUploadListener implements EventSubscriberInterface
{
    private $fileUploader;

    public function __construct(FileUploader $fileUploader)
    {
        $this->fileUploader = $fileUploader;
    }

    public static function getSubscribedEvents()
    {
        return [
            'easy_admin.pre_update'  => ['postImage'],
            'easy_admin.pre_persist' => ['postImage'],
        ];
    }

    public function postImage(GenericEvent $event) {
        $entity = $event->getSubject();
        $method = $event->getArgument('request')->getMethod();

        if (!($entity instanceof Skill) && !($entity instanceof Weapon) && $method !== Request::METHOD_POST) {
            return;
        }

        $image = $entity->getImageFile();
        if (!$image instanceof UploadedFile) {
            return;
        }

        $entity->setImage($this->fileUploader->upload($image));
    }
}